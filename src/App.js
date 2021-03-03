import React from "react";
import "./App.css";
import { Builder, parseString } from "xml2js";

window.api.receive("fileOpened", data => {
  parseString(data, (err, result) => {
    const newWaypoints = result.gpx.wpt.filter((_, idx) => idx % 2 === 0);
    const newFile = {
      ...result,
      gpx: {
        ...result.gpx,
        wpt: newWaypoints
      }
    };

    const builder = new Builder();
    const xml = builder.buildObject(newFile);

    window.api.send("saveFile", xml);
  });
});

const App = () => {
  const open = () => window.api.send("openFile", null);

  return (
    <div className="App">
      <h1>GPX</h1>
      <p>After uploading every 2nd waypoint will be removed</p>
      <button onClick={open}>Choose File</button>
    </div>
  );
};

export default App;
