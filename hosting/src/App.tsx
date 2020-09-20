import React, {FunctionComponent} from 'react';
import {RouteComponentProps, Router} from '@reach/router'


type User = {
    displayName:string;
}
type Group = {
    id:string;
    name:string;
    author: User;
}

interface JoinRouteProps {
    token: string;
}

interface JoinGroupProps {
    group: Group
}
const JoinCard:FunctionComponent<JoinGroupProps> = ({group})=>{
    return <div>
        <a href={`scoreguess://join/${group.id}`}>{group.author.displayName} vous invite à Rejoindre {group.name}</a>
    </div>
}

const JoinRoute: FunctionComponent<RouteComponentProps<JoinRouteProps>> = ({token}) => {
    let group
    try {
        if (token != null) {
            const decoded = window.atob(token)
            group = JSON.parse(decoded)
        }
    } catch (e) {
        console.log(e)
        //setState(e)
    } finally {
        return <JoinCard group={group}/>
    }
}

function App() {
    console.log(window.btoa(JSON.stringify({
        id:"test",
        name:"Ligue Hein?",
        author: {
            displayName:"Chazz"
        }
    })))
    return (
        <div className="App">
            <Router>
                <JoinRoute path="join/:token"/>
            </Router>
        </div>
    );
}

export default App;


