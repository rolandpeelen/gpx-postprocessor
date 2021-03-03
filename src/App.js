import React from "react";
import "./App.css";
import { Builder, parseString } from "xml2js";

const states = {
  initial: "INITIAL",
  editing: "EDITING"
};

const App = () => {
  const [state, setState] = React.useState(states.initial);
  const [options, setOptions] = React.useState({ filterEvery: 2 });
  const [originalFile, setOriginalFile] = React.useState(null);
  const [file, setFile] = React.useState(null);
  const open = () => window.api.send("openFile", null);
  const save = () => {
    const builder = new Builder();
    const xml = builder.buildObject(file);

    window.api.send("saveFile", xml);
  };

  React.useEffect(() => {
    window.api.receive("fileSaved", data => {
      setState(states.initial);
    });

    window.api.receive("fileOpened", data => {
      parseString(data, (err, result) => {
        setOriginalFile(result);
        setState(states.editing);
      });
    });
  }, []);

  React.useEffect(() => {
    if (originalFile === null) return;
    const newWaypoints = originalFile.gpx.wpt.filter(
      (_, idx) => idx % options.filterEvery === 0
    );
    const newFile = {
      ...originalFile,
      gpx: {
        ...originalFile.gpx,
        wpt: newWaypoints
      }
    };
    setFile(newFile);
  }, [options, originalFile]);

  return (
    <div className="App">
      <h1>GPX</h1>
      <p>Pick a GPX file</p>

      {state === states.initial && (
        <>
          <button onClick={open}>Choose File</button>
        </>
      )}
      {state === states.editing && (
        <>
          <hr />
          <form action="">
            <label for="filterEvery">
              <input
                type="number"
                id="filterEvery"
                onChange={e =>
                  setOptions(options => ({
                    ...options,
                    filterEvery: e.target.value
                  }))
                }
                defaultValue={options.filterEvery}
              />
            </label>
          </form>
          <h4>Waypoints</h4>
          <p>Original: {originalFile.gpx.wpt.length}</p>
          <p>Edited: {file.gpx.wpt.length}</p>
          <button onClick={save}>SaveFile</button>
        </>
      )}
    </div>
  );
};

export default App;
