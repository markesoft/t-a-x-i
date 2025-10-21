export default defineEventHandler(async (event) => {
  const { pickup, destination } = getRouterParams(event);
  try {
    const data = await $fetch(
      process.env.API_OPENROUTESERVICE_URL +
        "/v2/directions/driving-car" +
        "?start=" +
        pickup +
        "&end=" +
        destination +
        "&api_key=" +
        process.env.API_OPENROUTESERVICE_API_KEY,
    );
    return data;
  } catch (err) {
    console.log(err);
  }
});
