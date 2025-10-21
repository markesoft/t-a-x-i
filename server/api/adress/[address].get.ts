export default defineEventHandler(async (event) => {
  const { address } = getRouterParams(event);
  console.log("---debug-->", address);
  try {
    if (address === "null" || address === "" || address.length < 3) return "";

    const data = await $fetch(
      process.env.API_OPENROUTESERVICE_URL +
        "/geocode/autocomplete" +
        "?text=" +
        address +
        "&api_key=" +
        process.env.API_OPENROUTESERVICE_KEY,
    );
    console.log("+++:", data);
    return data;
  } catch (err) {
    console.log(err);
  }
});
