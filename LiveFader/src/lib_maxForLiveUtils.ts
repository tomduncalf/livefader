export const getLiveObjectById = (id: any) => {
  var api = new LiveAPI();
  api.id = Number(id);
  return api;
};
