const admin = require("firebase-admin");

/*
 * functions in this file handle the connection to firebase real database
 * the name and signature of these functions are strongly inspired by mongo and mongoose
 * c.f. https://mongoosejs.com/docs/queries.html
 */
const findOne = async (resourceType, resourceId) => {
  // we first retrieve a resource like "/fixtures/-Mabcdefghijk"
  const ref = admin.database().ref(`${resourceType}/${resourceId}`);

  // then wait for the snapshot from the ref using value event
  // we try to read the resource before removing it
  // this way we can return the deleted resource from this resolver
  // c.f. https://firebase.google.com/docs/database/admin/retrieve-data#value
  const snapshot = await ref.once("value");
  return snapshot.val();
};
/**
 * @param {string} resourceType - the resource type, could be fixtures or teams, etc...
 * @param {string} resourceId - the id of the resource
 * @param {function} updateFn - a function that should return the updated resource
 * @return {Promise<*>}
 */
const findOneAndUpdate = async (resourceType, resourceId, updateFn) => {
  // we first retrieve a resource like "/fixtures/-Mabcdefghijk"
  const ref = admin.database().ref(`${resourceType}/${resourceId}`);

  // then wait for the snapshot from the ref using value event
  // we try to read the resource before removing it
  // this way we can return the deleted resource from this resolver
  // c.f. https://firebase.google.com/docs/database/admin/retrieve-data#value
  const snapshot = await ref.once("value");
  const resource = snapshot.val();
  const updatedResource = updateFn(resource);
  // set the ref in firebase
  await ref.set({
    ...updatedResource,
  });

  return updatedResource;
};

const findOneAndDelete = async (resourceType, resourceId) => {
  // we first retrieve a resource like "/teams/-Mabcdefghijk"
  const ref = admin.database().ref(`${resourceType}/${resourceId}`);

  // then wait for the snapshot from the ref using value event
  // we try to read the resource before removing it
  // this way we can return the deleted resource from this resolver
  // c.f. https://firebase.google.com/docs/database/admin/retrieve-data#value
  const snapshot = await ref.once("value");
  const deletedResource = snapshot.val();

  // remove the ref in firebase
  await ref.remove();

  return deletedResource;
};

/**
 * @param {string} resourceType - the resource type, could be fixtures or teams, etc...
 * @param {any} resource - the actual resource without an id though !
 * @return {Promise<*[]>}
 */
const save = async (resourceType, resource) => {
  // c.f. https://firebase.google.com/docs/database/admin/save-data#section-push
  const ref = admin.database().ref(resourceType).push();
  const savedResource = {
    ...resource,
    id: ref.key,
  };
  await ref.set(savedResource);
  return savedResource;
};

/**
 *
 * @param {String} resourceType
 * @return {Promise<*[]>}
 */
const find = async (resourceType) => {
  const snapshot = await admin.database().ref(resourceType).once("value");
  const resources = await snapshot.val();
  return Object.keys(resources).map((key) => resources[key]);
};

module.exports = {
  save,
  find,
  findOne,
  findOneAndUpdate,
  findOneAndDelete,
};
