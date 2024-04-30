let quantitativeAttribute = []
let categoricalAttribute = []
const columnsToBeExcluded = ["Number", "Name"]
const transitionDuration = 1000;

let scatterplotDatapoints
const POKEMON_BASE_DATA_PATH = "Data/pokemon.csv"
const MOVES_DATA_PATH = "Data/moves.csv"
let basePokemonData, organisedData, mergedData
let movesData
const MAX_DEPTH = 3
const POWER = "Power"
const PP = "PP"
const PROBABILITY = "Prob. (%)"
const TM = "TM"
const EFFECT = "Effect"
const ACCURACY = "Acc."
let currentPokemon
document.addEventListener('DOMContentLoaded', async () => {
    await loadData()
    mergedData = mergeAndCombineTypes(basePokemonData);
    await populateQuantitativeAndCategoricalAttribute()
    console.log(mergedData);
    organisedData = organizeMovesData(movesData)
    console.log(organisedData)
    populateXAttributeSelectDropDown()
    populateYAttributeSelectDropDown()
    populateColorSelectDropDown()
    populateSizeSelectDropDown()
    initScatterPlot()
    await drawScatterPlot()
    // plotRadarChart()
    document.getElementById("add_to_radar_button").addEventListener("click", plotRadarChart, true);

});


function convertToHierarchy(movesHashMap, allowedMoveTypes) {
    const hierarchy = {name: "moves", children: []};

    for (const moveType in movesHashMap) {
        if (!allowedMoveTypes.map(m => m.toLowerCase()).includes(moveType))
            continue
        const moveTypeNode = {name: moveType, children: []};

        for (const attackType in movesHashMap[moveType]) {
            const attackTypeNode = {name: attackType, children: []};

            for (const moveName in movesHashMap[moveType][attackType]) {
                const moveDetails = movesHashMap[moveType][attackType][moveName];
                const moveNode = {name: moveName, ...moveDetails};
                attackTypeNode.children.push(moveNode);
            }

            moveTypeNode.children.push(attackTypeNode);
        }

        hierarchy.children.push(moveTypeNode);
    }

    return hierarchy;
}

function organizeMovesData(movesData) {
    const movesHashMap = {};

    movesData.forEach(move => {
        const moveType = move.Type.toLowerCase();
        const attackType = move["Cat."].toLowerCase();
        const moveName = move.Name.toLowerCase();

        if (!movesHashMap[moveType]) {
            movesHashMap[moveType] = {};
        }

        if (!movesHashMap[moveType][attackType]) {
            movesHashMap[moveType][attackType] = {};
        }

        movesHashMap[moveType][attackType][moveName] = {
            Accuracy: move[ACCURACY],
            PP: move.PP,
            TM: move.TM,
            Effect: move.Effect,
            Probability: move[PROBABILITY],
            Power: move.Power,
            value: 1
        };
    });

    return movesHashMap;
}

function mergeAndCombineTypes(data) {
    const mergedData = {};
    data.forEach(obj => {
        const id = obj.Number;
        const name = obj.Name;
        const type = obj.Type;
        const hp = obj.HP
        const total = obj.Total
        const attack = obj.Attack
        const defense = obj.Defense
        const spAttack = obj["Special Attack"]
        const spDefense = obj["Special Defense"]
        const speed = obj["Speed"]

        if (mergedData[id]) {
            mergedData[id].Type.add(type);
        } else {
            mergedData[id] = {
                Number: id,
                Name: name,
                Type: new Set([type]),
                Total: total,
                Attack: attack,
                Defense: defense,
                "Special Attack": spAttack,
                "Special Defense": spDefense,
                Speed: speed,
                HP: hp
            };
        }
    });

    const mergedArray = Object.values(mergedData);

    mergedArray.forEach(entry => {
        entry.Type = Array.from(entry.Type);
    });

    return mergedArray;
}


const loadData = async () => {
    basePokemonData = await getLoadedDataset(POKEMON_BASE_DATA_PATH)
    movesData = await getLoadedDataset(MOVES_DATA_PATH)
}
const getLoadedDataset = async (path) => {
    return new Promise((resolve, reject) => {
        d3.csv(path)
            .then(data => resolve(data))
            .catch(error => reject(error))
    })
}

const populateXAttributeSelectDropDown = () => {
    const xAttributeSelect = document.getElementById("x-attribute-select");
    xAttributeSelect.innerHTML = "";

    quantitativeAttribute.forEach(function (dataset) {
        const option = document.createElement("option");
        option.text = dataset;
        option.value = dataset;
        if (dataset === "Attack") {
            option.selected = true;
        }
        xAttributeSelect.add(option);
    });
    // xAttributeSelect.innerHTML = "Attack";
    // xAttributeSelect.value = "Attack";

}

const populateQuantitativeAndCategoricalAttribute = async () => {
    quantitativeAttribute = []
    categoricalAttribute = []

    for (const element of Object.entries(basePokemonData[0])) {
        const colName = element[0]
        const colVal = element[1]
        if (columnsToBeExcluded.includes(colName)) {
            continue
        }
        if (isNaN(colVal) === false) {
            quantitativeAttribute.push(colName)
        } else if (typeof (colVal) === "string") {
            categoricalAttribute.push(colName)
        }
    }


}

const populateYAttributeSelectDropDown = () => {
    const yAttributeSelect = document.getElementById("y-attribute-select");
    yAttributeSelect.innerHTML = "";
    quantitativeAttribute.forEach(function (dataset) {
        const option = document.createElement("option");
        option.text = dataset;
        option.value = dataset;
        if (dataset === "Defense") {
            option.selected = true;
        }
        yAttributeSelect.add(option);
    });
}
const populateColorSelectDropDown = () => {
    const colorSelect = document.getElementById("color-select");
    colorSelect.innerHTML = "";
    categoricalAttribute.forEach(function (dataset) {
        const option = document.createElement("option");
        option.text = dataset;
        colorSelect.add(option);
    });
}


const populateSizeSelectDropDown = () => {
    const colorSelect = document.getElementById("size-select");
    colorSelect.innerHTML = "";
    quantitativeAttribute.forEach(function (dataset) {
        const option = document.createElement("option");
        option.text = dataset;
        option.value = dataset;
        if (dataset === "Total") {
            option.selected = true;
        }
        colorSelect.add(option);
    });
}


let boxplotSvg, width, height, margin, colorScale, xScale, yScale, zScale, xAxis, yAxis, xAxisGroup, yAxisGroup;
const initScatterPlot = () => {
    margin = {top: 40, right: 50, bottom: 40, left: 70};
    width = 1200 - margin.left - margin.right;
    height = 700 - margin.top - margin.bottom;

    boxplotSvg = d3.select("#scatter_plot_svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    colorScale = d3.scaleOrdinal(d3.schemePaired);
    const currentXAttribute = document.getElementById("x-attribute-select").value;
    const currentYAttribute = document.getElementById("y-attribute-select").value;
    const currentColorAttribute = document.getElementById("color-select").value;
    const currentSizeAttribute = document.getElementById("size-select").value;

    const data = mergedData.map(item => {
        return {
            x: item[currentXAttribute],
            y: item[currentYAttribute],
            colorAttribute: item[currentColorAttribute],
            sizeAttribute: item[currentSizeAttribute]
        }
    })
    xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.x), d3.max(data, d => d.x)])
        .range([0, width]);

    yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.y), d3.max(data, d => d.y)])
        .range([height, 0]);


    // Add x-axis label
    boxplotSvg.append('text')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom)
        .attr('text-anchor', 'middle')
        .attr("class", "scatterPlotXLabel")
        .style("font-size", "12px")
        .text(currentXAttribute);

    // Add y-axis label
    boxplotSvg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -width / 3)
        .attr('y', margin.left / 2 - 70)
        .attr('text-anchor', 'middle')
        .attr("class", "scatterPlotYLabel")
        .style("font-size", "12px")
        .text(currentYAttribute);


    // Create axis
    xAxis = d3.axisBottom(xScale);
    yAxis = d3.axisLeft(yScale);
    xAxisGroup = boxplotSvg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    yAxisGroup = boxplotSvg.append("g")
        .call(yAxis);
}

function createGradient(gradientId, colors) {
    const svg = d3.select("svg");
    const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("x2", "100%")
        .attr("y1", "0%")
        .attr("y2", "0%");

    colors.forEach((color, i) => {
        gradient.append("stop")
            .attr("offset", `${(i * 100) / (colors.length - 1)}%`)
            .attr("stop-color", color);
    });
}

const circleColorMapping = (d) => {
    // Generate a unique color for each type
    const colors = d.colorAttribute.map(type => colorScale(type));
    // If there are multiple types, create a gradient
    if (colors.length > 1) {
        const gradientId = "gradient-" + d.id;
        createGradient(gradientId, colors);
        return "url(#" + gradientId + ")";
    } else {
        return colors[0];
    }
}
const drawScatterPlot = async () => {

    const currentXAttribute = document.getElementById("x-attribute-select").value;
    const currentYAttribute = document.getElementById("y-attribute-select").value;
    const currentColorAttribute = document.getElementById("color-select").value;
    const currentSizeAttribute = document.getElementById("size-select").value;

    let idGen = 0;
    let i = 1
    const data = mergedData.map(item => {
        item["id"] = i++
        return {
            x: Number(item[currentXAttribute]),
            y: Number(item[currentYAttribute]),
            colorAttribute: item[currentColorAttribute],
            sizeAttribute: Number(item[currentSizeAttribute]),
            // id: i++,
            item: item
        }
    })

    xScale.domain([d3.min(data, d => d.x), d3.max(data, d => d.x)])
    yScale.domain([d3.min(data, d => d.y), d3.max(data, d => d.y)])
    zScale = d3.scaleSqrt().domain([d3.min(data, d => d.sizeAttribute), d3.max(data, d => d.sizeAttribute)]).range([1, 10])
    // Update axes
    xAxisGroup.transition()
        .duration(transitionDuration).call(xAxis);
    yAxisGroup.transition()
        .duration(transitionDuration).call(yAxis);

    // Update x-axis label
    boxplotSvg.selectAll('.scatterPlotXLabel').text(currentXAttribute);

    // Update y-axis label
    boxplotSvg.selectAll('.scatterPlotYLabel').text(currentYAttribute);

    scatterplotDatapoints = boxplotSvg.selectAll(".scatterplotDatapoints")
        .data(data)
    const tooltip = getTootTip()
    const colorScale = d3.scaleOrdinal(d3.schemeTableau10)

    scatterplotDatapoints
        .join(
            enter => enter.append("circle")
                .attr("cx", d => xScale(d.x))
                .attr("cy", d => yScale(d.y))
                .attr("r", d => zScale(d.sizeAttribute))
                .style("fill", d => circleColorMapping(d))
                // d => colorScale(d.colorAttribute)
                .attr("stroke", 'black')
                .attr("id", (d) => {
                    return "dot-" + d.id;
                })
                .style('stroke-width', '1.5')
                .attr("class", "scatterplotDatapoints")
                .on("click", (e, d) => {
                    console.log(d)
                    return drawIcicle(d.item)
                })
                .on('mouseover', function (event, d) {
                    tooltip.style('visibility', 'visible');
                    d3.select(this)
                        .attr("filter", "brightness(150%) contrast(250%)")
                        .attr('stroke', 'black')
                        .attr('stroke-width', 3)
                    // .attr("transform", "scale(1.5)"); // Scale up the element

                })
                .on('mousemove', function (event, d) {
                    tooltip
                        .style('top', event.pageY - 10 + 'px')
                        .style('left', event.pageX + 10 + 'px')
                        .html(`Pokemon: ${d.item.Name}`);
                })
                .on('mouseout', function (event, d) {
                    tooltip.style('visibility', 'hidden');
                    d3.select(this)
                        .attr("filter", "brightness(100%) contrast(100%)")
                        .attr('stroke', 'black')
                        .attr('stroke-width', 1)
                    // .attr("transform", "scale(1)"); // Scale up the element

                }),
            update => update.transition()
                .duration(transitionDuration)
                .attr("cx", d => xScale(d.x))
                .attr("cy", d => yScale(d.y))
                .attr("r", d => zScale(d.sizeAttribute))
                .style("fill", d => circleColorMapping(d))
                // .style("fill", d => colorScale(d.colorAttribute))
                .attr("id", (d) => {
                    return "dot-" + d.id;
                }),
            exit => exit.remove()
        )
    let legendMap = {}
    data.forEach(d => {
        d.colorAttribute.forEach(type => {
            legendMap[type] = colorScale(type);

        })
    });
    console.log(legendMap)
    createLegend(legendMap);
}
const createLegend = (colorMap) => {
    const legend = boxplotSvg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(1160,0)"); // Adjust position as needed

    const legendRectSize = 18;
    const legendSpacing = 4;

    const legendItems = legend.selectAll(".legend-item")
        .data(Object.entries(colorMap))
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * (legendRectSize + legendSpacing)})`);

    legendItems.append("rect")
        .attr("width", legendRectSize)
        .attr("height", legendRectSize)
        .style("fill", d => d[1]); // Use color from the color map

    legendItems.append("text")
        .attr("x", legendRectSize + legendSpacing)
        .attr("y", legendRectSize / 2)
        .attr("dy", "0.35em")
        .text(d => d[0]); // Display title text

    return legend;
};

const getTootTip = () => {
    return d3
        .select('body')
        .append('div')
        .style('position', 'absolute')
        .style('z-index', '10')
        .style('visibility', 'hidden')
        .style('background-color', 'white')
        .style('border', 'solid')
        .style('border-width', '2px')
        .style('border-radius', '5px')
        .style('padding', '5px');
}

const updateXAttribute = async () => {
    await drawScatterPlot()
}

const updateYAttribute = async () => {
    await drawScatterPlot()
}
const updateSizeAttribute = async () => {
    await drawScatterPlot()
}

const updateColorAttribute = async () => {
    await drawScatterPlot()
}

const drawIcicle = (item) => {
    currentPokemon = item
    const name = item.Name
    const allowedMoveTypes = item.Type
    if (d3.select("#icicleplot_svg") !== undefined)
        d3.select("#icicleplot_svg").selectAll("*").remove();
    document.getElementById("icicle_header").innerHTML = `${name}'s moves hierarchy`
    document.getElementById("add_to_radar_button").innerHTML = `Add ${name} to Stats Radar`
    const data = convertToHierarchy(organisedData, allowedMoveTypes)

    // Specify the chart’s dimensions.
    const width = 928;
    const height = 400;

    // Create the color scale.
    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));

    // Compute the layout.
    const hierarchy = d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.height - a.height || b.value - a.value);
    const root = d3.partition()
        .size([height, (hierarchy.height + 1) * width / 3])
        (hierarchy);

    // Create the SVG container.
    const svg = d3.select("#icicleplot_svg")
        .attr("viewBox", [0, 0, width, height])
        .attr("width", width)
        .attr("height", height)
        .attr("style", " height: auto; font: 10px sans-serif;");

    // Append cells.
    const cell = svg
        .selectAll("g")
        .data(root.descendants())
        .join("g")
        .attr("transform", d => `translate(${d.y0},${d.x0})`);

    const rect = cell.append("rect")
        .attr("width", d => d.y1 - d.y0 - 1)
        .attr("height", d => rectHeight(d))
        .attr("fill-opacity", 0.6)
        .attr("fill", d => {
            if (!d.depth) return "#dfe6e6";
            while (d.depth > 1) d = d.parent;
            return color(d.data.name);
        })
        .style("cursor", "pointer")
        .on("click", clicked);

    const text = cell.append("text")
        .style("user-select", "none")
        .attr("pointer-events", "none")
        .attr("x", 4)
        .attr("y", 13)
        .attr("fill-opacity", d => +labelVisible(d));

    text.append("tspan")
        .text(d => d.data.name);


    const format = d3.format(",d");
    const tspan = text.append("tspan")
        .attr("fill-opacity", d => labelVisible(d) * 0.7)
        .text(d => {
            if (d.depth !== MAX_DEPTH)
                return ` ${format(d.value)}`
            else {
                const attackAttributes = d.data
                return `<br>\nPower: ${format(attackAttributes.Power)}<br>
                        Accuracy: ${format(attackAttributes.Accuracy)}<br>
                        Probability: ${format(attackAttributes.Probability)}<br>
                        Effect: ${attackAttributes.Effect}<br>
                        PP: ${format(attackAttributes.PP)}<br>`
            }
        })
    cell.append("title")
        .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

    // On click, change the focus and transitions it into view.
    let focus = root;

    function clicked(event, p) {
        if (focus === p) {
            if (p.depth !== 0)
                p = p.parent
            focus = p
        } else {
            focus = p
        }
        // focus = focus === p ? p = p.parent : p;

        root.each(d => d.target = {
            x0: (d.x0 - p.x0) / (p.x1 - p.x0) * height,
            x1: (d.x1 - p.x0) / (p.x1 - p.x0) * height,
            y0: d.y0 - p.y0,
            y1: d.y1 - p.y0
        });

        const t = cell.transition().duration(750)
            .attr("transform", d => `translate(${d.target.y0},${d.target.x0})`);

        rect.transition(t).attr("height", d => rectHeight(d.target));
        text.transition(t).attr("fill-opacity", d => +labelVisible(d.target));
        tspan.transition(t).attr("fill-opacity", d => labelVisible(d.target) * 0.7);
    }

    function rectHeight(d) {
        return d.x1 - d.x0 - Math.min(1, (d.x1 - d.x0) / 2);
    }

    function labelVisible(d) {
        return d.y1 <= width && d.y0 >= 0 && d.x1 - d.x0 > 16;
    }

    return svg.node();
}
let data = [];

const plotRadarChart = (addCurrentPokemon) => {
    if (d3.select("#radarplot_svg") !== undefined)
        d3.select("#radarplot_svg").selectAll("*").remove();
    if (d3.select("#legend") !== undefined)
        d3.select("#legend").selectAll("*").remove();
    if (data.length === 0 && currentPokemon === undefined)
        return
    console.log("Plot Radar Chart")
    const colorScale = d3.scaleOrdinal(d3.schemeTableau10)

    let features = ["HP", "Attack", "Defense", "Special Attack", "Special Defense", "Speed"];
    let featureExtents = {};
    features.forEach(feature => {
        let values = mergedData.map(d => Number(d[feature]));
        featureExtents[feature] = [d3.min(values), d3.max(values)];
    });
    console.log(currentPokemon)

    if (addCurrentPokemon) {
        let point = {}
        features.forEach(f => point[f] = Number(currentPokemon[f]));
        point["Name"] = currentPokemon["Name"]

        point["id"] = currentPokemon["id"]
        point["in"] = data.length

        data.push(point);
        console.log(data);
    }

    let width = 800;
    let height = 600;
    let svg = d3.select("#radarplot_svg")
        .attr("width", width)
        .attr("height", height)

    const legendItems = d3.select("#legend")
        .selectAll(".legend-item")
        .data(data)
        .enter()
        .append("div")
        .attr("class", "legend-item");

    legendItems.append("div")
        .html((d, i) => `
        <div class="legend-item-row">
            <div class="color-circle" style="background-color: ${colorScale(i)};"></div>
            <div class="legend-text">${data[i].Name}</div>
            <button class="remove-button" data-index="${i}">Remove</button>
        </div>
    `).attr("id", data.length - 1)
        .style("margin-left", "20px") // Add left margin
        .on("click", (event, d) => {
            const index = parseInt(d3.select(event.currentTarget).attr("id"));
            data.splice(index, 1);

            plotRadarChart(false);
        });



    // Update the domain of the radial scale for each feature
    let radialScales = {};
    features.forEach(feature => {
        radialScales[feature] = d3.scaleLinear()
            .domain([0, featureExtents[feature][1]]) // Use the maximum value of each feature as the upper bound
            .range([0, 250]);
    });
    // let ticks = [2, 4, 6, 8, 10];

    // Update the ticks for each axis
    let ticks = {};
    features.forEach(feature => {
        ticks[feature] = d3.ticks(0, featureExtents[feature][1], 5); // Adjust the number of ticks as desired
    });

    // svg.selectAll("circle")
    //     .data(ticks)
    //     .join(
    //         enter => enter.append("circle")
    //             .attr("cx", width / 2)
    //             .attr("cy", height / 2)
    //             .attr("fill", "none")
    //             .attr("stroke", "gray")
    //             .attr("r", d => radialScale(d))
    //     );

    // check ticks circle Todo
    // Redraw the circles representing ticks on the radial axes
    svg.selectAll("circle")
        .data(features)
        .join(
            enter => enter.append("g")
                .selectAll("circle")
                .data(d => ticks[d])
                .enter()
                .append("circle")
                .attr("cx", width / 2)
                .attr("cy", height / 2)
                .attr("fill", "none")
                .attr("stroke", "gray")
                .attr("r", d => radialScales[d])
        );


    // svg.selectAll(".ticklabel")
    //     .data(ticks)
    //     .join(
    //         enter => enter.append("text")
    //             .attr("class", "ticklabel")
    //             .attr("x", width / 2 + 5)
    //             .attr("y", d => height / 2 - radialScale(d))
    //             .text(d => d.toString())
    //     );

    // Redraw the labels for the ticks on the radial axes
    for (const f of features) {
        svg.selectAll(".ticklabel" + f)
            .data(ticks[f])
            .join(
                enter => enter.append("g")
                    .selectAll(".ticklabel")
                    .data(d => d)
                    .enter()
                    .append("text")
                    .attr("class", "ticklabel" + f)
                    .attr("x", width / 2 + 5)
                    .attr("y", (d, i, j) => {
                        console.log(d)
                        console.log(i)
                        console.log(j)
                        return height / 2 - radialScales[features[j]](d)
                    })
                    .text(d => d.toString())
            );
    }


    // Redefine the angleToCoordinate function to use the appropriate radial scale for each feature
    function angleToCoordinate(angle, value, feature) {
        let x = Math.cos(angle) * radialScales[feature](value);
        let y = Math.sin(angle) * radialScales[feature](value);
        return {"x": width / 2 + x, "y": height / 2 - y};
    }


    // Redefine the featureData array with updated coordinate values
    let featureData = features.map((f, i) => {
        let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
        return {
            "name": f,
            "angle": angle,
            "line_coord": angleToCoordinate(angle, featureExtents[f][1], f), // Use the maximum value of each feature for axis lines
            "label_coord": angleToCoordinate(angle, featureExtents[f][1] + 0.5, f) // Use a slightly larger value for axis labels
        };
    });

    // Redraw the axis lines
    svg.selectAll("line")
        .data(featureData)
        .join(
            enter => enter.append("line")
                .attr("x1", width / 2)
                .attr("y1", height / 2)
                .attr("x2", d => d.line_coord.x)
                .attr("y2", d => d.line_coord.y)
                .attr("stroke", "black")
        );


    // Redraw the axis labels
    svg.selectAll(".axislabel")
        .data(featureData)
        .join(
            enter => enter.append("text")
                .attr("x", d => d.label_coord.x)
                .attr("y", d => d.label_coord.y)
                .text(d => d.name)
        );

    let line = d3.line()
        .x(d => d.x)
        .y(d => d.y);

    function getPathCoordinates(data_point) {
        let coordinates = [];
        for (let i = 0; i < features.length; i++) {
            let ft_name = features[i];
            let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
            coordinates.push(angleToCoordinate(angle, data_point[ft_name], ft_name));
        }
        return coordinates;
    }


    // Redraw the paths with updated coordinates
    svg.selectAll("path")
        .data(data)
        .join(
            enter => enter.append("path")
                .datum(d => getPathCoordinates(d))
                .attr("d", line)
                .attr("stroke-width", "4px")
                .attr("stroke", (_, i) => colorScale(i))
                // .style("stroke-opacity", 1)
                .attr("fill", (_, i) => {
                    console.log(i)
                    return colorScale(i)
                })
                .classed("stroke-opacity", true) .transition() // Apply transition to new elements
                .duration(1000)
               // Apply stroke-opacity using class
                .style("opacity", 0.4), // Apply opacity separately
            update => update.append("path")
                .datum(d => getPathCoordinates(d))
                .attr("d", line)
                .attr("stroke-width", "4px")
                .attr("stroke", (_, i) => colorScale(i))
                // .style("stroke-opacity", 1)

                .attr("fill", (_, i) => {
                    console.log(i)
                    return colorScale(i)
                })
                .classed("stroke-opacity", true) // Apply stroke-opacity using class
                .style("opacity", 0.4), // Apply opacity separately,
            exit => exit.remove()
        );
    console.log("radar end")
}
