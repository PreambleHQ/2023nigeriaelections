let width = document.getElementById("chart").getBoundingClientRect().width;
let height = document.getElementById("chart").getBoundingClientRect().height;
// draw a map of nigeria using d3
Promise.all([
  d3.json(
    "https://raw.githubusercontent.com/PreambleHQ/Nigeria/main/data/nigeria-states.json"
  ),
  d3.csv(
    "https://raw.githubusercontent.com/PreambleHQ/Nigeria/main/data/election.csv"
  ),
  d3.csv(
    "https://raw.githubusercontent.com/PreambleHQ/Nigeria/main/data/candidates.csv"
  ),
]).then((data) => {
  const [states, election, candidates] = data;

  drawMap(states, election, candidates, width, height);

  let resizeTimer;

  window.addEventListener("resize", () => {
    width = document.getElementById("chart").getBoundingClientRect().width;
    height = document.getElementById("chart").getBoundingClientRect().height;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      d3.select("svg").remove();
      drawMap(states, election, width, height);
    }, 500);
  });
});

function drawMap(states, election, candidates, width, height) {
  election.forEach((d) => {
    State = d.State;
    Object.keys(d).forEach((key) => {
      if (key !== "State") {
        d[key] = +d[key];
      }
    });
  });

  // create a state map using d3
  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("preserveAspectRatio", "xMidYMid meet");

  // create a projection
  const projection = d3
    .geoMercator()
    .fitSize(
      [width, height],
      topojson.feature(states, states.objects.NGA_adm1)
    );

  // create a path generator
  const pathGenerator = d3.geoPath().projection(projection);

  // create a group for the states
  svg
    .append("g")
    .attr("class", "states")
    .attr("cursor", "pointer")
    .selectAll("path")
    .data(topojson.feature(states, states.objects.NGA_adm1).features)
    .enter()
    .append("path")
    .attr("d", pathGenerator)
    .attr("fill", "#90fcad")
    .attr("stroke", "white")
    .attr("stroke-width", 1)
    .attr("pointer-events", "all")
    .on("mousemove", onMouseMove)
    .on("mouseout", function () {
      d3.select(this).attr("opacity", 1);
      d3.select(".tooltip").style("display", "none");
    });

  function onMouseMove(e, d) {
    d3.select(this).attr("opacity", 0.8);
    const tooltip = d3.select(".tooltip");
    const state = election.find((e) => e.State === d.properties.NAME_1);
    const winner = Object.keys(state).reduce((a, b) =>
      state[a] > state[b] ? a : b
    );

    tooltip
      .style("left", width > 640 ? e.pageX + 10 + "px" : "0px")
      .style("top", width > 640 ? e.pageY + 10 + "px" : "0px")
      .style("display", "block")
      .style("padding", "5px").html(`
        <div>
            <h2>${d.properties.NAME_1}</h2>
            <button>X</button>
        </div>
        <table>
            <thead>
            <tr>
                <th>Candidate</th>
                <th>Party</th>
                <th>Votes</th>
                <th>Percentage</th>
            </tr>
            </thead>
            <tbody>
            ${Object.keys(state)
              .splice(1)
              .map(
                (key) =>
                  `<tr style='background-color: ${
                    key === winner ? "#ccc" : "inherit"
                  }'>
                    <td class='candidate'>
                    <img class='candidate-photo' src='${
                      candidates.find((candidate) => candidate.Party === key)[
                        "Image"
                      ]
                    }' alt='party logo' />
                    <p>
                      ${
                        candidates.find((candidate) => candidate.Party === key)[
                          "Candidate Name"
                        ]
                      }
                    </p>
                    
                    </td>
                    <td>${
                      candidates.find((candidate) => candidate.Party === key)[
                        "Party"
                      ]
                    }</td>
                    <td>${state[key]}</td>
                    <td>${
                      isNaN(
                        (state[key] /
                          Object.values(state)
                            .splice(1)
                            .reduce((a, b) => a + b)) *
                          100
                      )
                        ? 0
                        : (
                            (state[key] /
                              Object.values(state)
                                .splice(1)
                                .reduce((a, b) => a + b)) *
                            100
                          ).toFixed(2)
                    }% </td>
                    </tr>`
              )
              .join("")}
            </tbody>
        </table>
        `);
  }

  d3.select(".tooltip button").on("click", function () {
    d3.select(".tooltip").style("display", "none");
  });

  // append state names
  svg
    .append("g")
    .attr("class", "state-names")
    .selectAll("text")
    .data(topojson.feature(states, states.objects.NGA_adm1).features)
    .enter()
    .append("text")
    .attr("class", "state-name")
    .attr("x", (d) => pathGenerator.centroid(d)[0])
    .attr("y", (d) => pathGenerator.centroid(d)[1])
    .attr("text-anchor", "middle")
    .attr("pointer-events", "none")
    .attr("font-size", 10)
    .attr("font-weight", "bold")
    .attr("fill", "gray")
    .text((d) =>
      d.properties.NAME_1 === "Federal Capital Territory"
        ? "FCT"
        : d.properties.NAME_1
    );
}
