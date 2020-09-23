if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./nonocache-sw.js", { scope: "./" });

  //   navigator.serviceWorker.ready.then((registration) => {
  //     registration.active.postMessage({
  //       config: {
  //         domains: [
  //           "https://cdn.jsdelivr.net/npm/@tensorflow",
  //           "https://tfhub.dev",
  //         ],
  //       },
  //     });
  //   });
}
