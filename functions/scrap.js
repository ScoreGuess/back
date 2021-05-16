
const getDataFromUrl = async (browser, url) => {
    const page = await browser.newPage()
    await page.setDefaultNavigationTimeout(0);

    await page.goto(url, {waitUntil: "networkidle2"});
    console.log(`${url}: evaluating the fixture hero...`)
    const ligue1MatchId = (new URL(url)).searchParams.get('matchId')
    const {date, away, home, ...result} = await page.evaluate(() => {
        let [matchDay] = document.querySelector('.hero .match-info h2').innerText
            .match(/([0-9]{2})/)
        let date = document.querySelector('.hero .match-info p:first-of-type').innerText
        let [homeScore, awayScore] = document.querySelector('.hero .clubs-info p:first-of-type').innerText.match(/([0-9]*) - ([0-9]*)/)
        let home = document.querySelector('.hero .clubs-info .team.home').innerText
        let away = document.querySelector('.hero .clubs-info .team.away').innerText
        let status = "PLANNED"
        let currentMinute = document.querySelector('.hero .clubs-info p.current-minute').innerText
        if (currentMinute === "TERMINÉ") {
            status = "FINISHED"
        } else if (currentMinute.match(/([0-9]*)/)) {
            status = "IN_PROGRESS"
        }
        return {
            home,
            status,
            away,
            matchDay: parseInt(matchDay, 10),
            date,
            homeScore: parseInt(homeScore, 10),
            awayScore: parseInt(awayScore, 10)
        }
    })
    // console.log(result.date)
    return {
        ...result,
        homeTeamId: getTeamIdFromLigue1(home),
        awayTeamId: getTeamIdFromLigue1(away),
        ligue1MatchId,
        competition: "-MMBpWFXXq3nTBJOiBnF",
        startDate: moment(date.substring(5), 'DD MMMM YYYY - HH:mm').format('YYYY-MM-DDTHH:mm')
    }
}


exports.scrap = functions.runWith({
    timeoutSeconds: 300,
    memory: "2GB"
}).https.onRequest(async (req, res) => {
    const url = 'https://www.ligue1.fr/calendrier-resultats'

    const browser = await puppeteer.launch({
        args: ["--no-sandbox"]
    });
    const page = await browser.newPage();
    await page.goto(url, {waitUntil: "networkidle2"});
    const links = await page.evaluate(() =>
        [...document.querySelectorAll('.match-result .discussion a')].map(link => link.href),
    )
    /*.filter((l,i)=>i===0)*/
    const result = await Promise.all(links.map(link => getDataFromUrl(browser, link)))

    const fixtures = await find("fixtures");

    await browser.close();

    return res.send({
        result,
        fixtures
    })
})

const getTeamIdFromLigue1 = (teamName) => {
    switch (teamName) {
        case "OL":
            return '-MEWbffd7Wn8csPlro5I'
        case "ASSE":
            return '-MEYmKbShbaiYingppY8'
        case "BORDEAUX":
            return '-MEYmUz0_69bF8DOObXI'
        case 'FC LORIENT':
            return "-MEYnldeea1Kk9MWA2cl"
        case 'FC NANTES':
            return "-MEYmhhBEbrWeNPCK489"
        case 'LOSC':
            return "-MEYmprYvjp-7PsxTuJN"
        case"RENNES":
            return "-MEYmyvE7Mr_77b5trVe"
        case "AS MONACO":
            return "-MEYn8C98K3UjRNCEQ3b"
        case "REIMS":
            return "-MEYnGQg3cJpr5chfvKo"
        case "DIJON FCO":
            return "-MEYnNHlUuXYAxOZrab7"
        case "ANGERS SCO":
            return "-MEYnWTYK_qVcD8YT9XE"
        case "STRASBOURG":
            return "-MEYnxP_ZqIxg_sMNHAw"
        case "MONTPELLIER":
            return "-MEYoHIEdbvte9wPrVKO"
        case "NÎMES":
            return "-MEYoY2GJ4giMHr9-HRj"
        case "BREST":
            return "-MEYoe8ukcj6rXqlGLXE"
        case "OGC NICE":
            return "-MEYol4fnjq9011r885o"
        case "RC LENS":
            return "-MEYot8KfqAZLml26MYJ"
        case "PSG":
            return "-MEYozfvwlam-D9QTVE2"
        case "FC METZ":
            return "-MEYp4GoXhU4XoJRVWTK"
        default:
            return teamName
    }
}
