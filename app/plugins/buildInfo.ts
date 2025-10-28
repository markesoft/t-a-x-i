export default defineNuxtPlugin(() => {
  const buildDate = "2025-10-24T20:10:26.336Z";
  
  return {
    provide: {
      buildInfo: {
        date: buildDate,
        version: "v2.10.24"
      }
    }
  }
})