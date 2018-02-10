/* global document, window */

const addImg = (url, doc = document) => {
  const img = doc.createElement("img");
  img.onload = () => doc.body.removeChild(img);
  img.onerror = img.onload;
  img.height = "1px";
  img.width = "1px";
  img.src = url;
  doc.body.appendChild(img);
};

const extract = timings => {
  const arr = [];
  for (const key in timings) {
    if (typeof timings[key] === "number") {
      const value = timings[key];
      arr.push({ key, value });
    }
  }

  return arr;
};

const Timings = (url, doc = document, win = window) => {
  const performance = "performance" in win ? win.performance : null;
  return {
    // user must know when site is ready to send data
    sendTiming: () => {
      if (!performance) return;

      const values = extract(performance.timing);
      const qs = values.reduce((acc, { key, value }) => {
        acc += acc.length ? "&" : "";
        return `${acc}${key}=${value}`;
      }, "");

      addImg(`${url}?timing&${qs}`, doc);
    },
    sendMeasures: () => {
      if (!performance) return;

      const start = performance.timing.navigationStart;
      const values = extract(performance.timing);

      const qs = values.reduce((acc, { key, value }) => {
        if (value === 0) {
          return acc;
        }
        acc += acc.length ? "&" : "";
        if (key === "navigationStart") {
          return (acc += `${key}=${value}`);
        }
        const diff = value - start;
        return (acc += `${key}=${diff}`);
      }, "");

      addImg(`${url}?measures&${qs}`, doc);
    },
    // marks are used for custom events
    sendMarks: () => {
      if (!performance) return;
      const marks = performance.getEntriesByType("mark");
      if (!marks.length) return;

      const qs = marks.reduce((acc, { name, startTime }) => {
        acc += acc.length ? "&" : "";
        return `${acc}${name}=${startTime}`;
      }, performance.timeOrigin ? `timeOrigin=${performance.timeOrigin}` : "");
      addImg(`${url}?marks&${qs}`, doc);
    },
    //
    sendCustomMeasures: () => {
      if (!performance) return;
      const measures = performance.getEntriesByType("measure");
      if (!measures.length) return;

      const qs = measures.reduce((acc, { name, duration }) => {
        acc += acc.length ? "&" : "";
        return `${acc}${name}=${duration}`;
      }, "");
      addImg(`${url}?customMeasures&${qs}`, doc);
    }
  };
};

export default Timings;
