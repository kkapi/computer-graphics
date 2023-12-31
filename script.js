const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const PIXEL_SIZE = 4;
const CANVAS_WIDTH = 500;
const CENTER = CANVAS_WIDTH / 2 - PIXEL_SIZE;
const SCREEN_Z = 300;
const CAMERA_Z = 650;

const cube = {
	vertex_table: [
		[127, 127, 127],
		[127, -127, 127],
		[-127, -127, 127],
		[-127, 127, 127],
		[127, 127, -127],
		[127, -127, -127],
		[-127, -127, -127],
		[-127, 127, -127],
	],

	edge_table: [
		[0, 1],
		[1, 2],
		[2, 3],
		[3, 0],
		[4, 5],
		[5, 6],
		[6, 7],
		[7, 4],
		[0, 4],
		[1, 5],
		[2, 6],
		[3, 7],
	],
};

const pyramid = {
	vertex_table: [
		[127, 110, 127],
		[127, 110, -127],
		[-127, 110, -127],
		[-127, 110, 127],
		[0, -110, 0],
	],

	edge_table: [
		[0, 1],
		[1, 2],
		[2, 3],
		[3, 0],
		[0, 4],
		[1, 4],
		[2, 4],
		[3, 4],
	],
};

const axisX = {
	vertex_table: [
		[-250, 250, -250],
		[250, 250, -250],
	],
	edge_table: [[0, 1]],
};

const axisY = {
	vertex_table: [
		[250, -250, -250],
		[250, 250, -250],
	],
	edge_table: [[0, 1]],
};

const axisZ = {
	vertex_table: [
		[200, 200, 200],
		[250, 250, -250],
	],
	edge_table: [[0, 1]],
};

let figure = cube;

function shiftCoordinates(vertex_table) {
	return vertex_table.map(row => row.map(value => value + CENTER));
}

function drawVertices(vertex_table) {
	for (let vertex of vertex_table) {
		ctx.fillRect(vertex[0], vertex[1], PIXEL_SIZE, PIXEL_SIZE);
	}
}

function drawEdges(vertex_table, edge_table) {
	ctx.beginPath();

	for (let edge of edge_table) {
		ctx.moveTo(
			vertex_table[edge[0]][0] + PIXEL_SIZE / 2,
			vertex_table[edge[0]][1] + PIXEL_SIZE / 2
		);
		ctx.lineTo(
			vertex_table[edge[1]][0] + PIXEL_SIZE / 2,
			vertex_table[edge[1]][1] + PIXEL_SIZE / 2
		);
	}

	ctx.stroke();
}

function rotateAroundX(vertex_table, angle) {
	const rotated_vertex_table = [];

	const radians = (angle * Math.PI) / 180;

	for (let vertex of vertex_table) {
		const [x, y, z] = vertex;

		const newY = y * Math.cos(radians) - z * Math.sin(radians);
		const newZ = y * Math.sin(radians) + z * Math.cos(radians);

		rotated_vertex_table.push([x, newY, newZ]);
	}

	return rotated_vertex_table;
}

function rotateAroundY(vertex_table, angle) {
	const rotated_vertex_table = [];

	const radians = (angle * Math.PI) / 180;

	for (let vertex of vertex_table) {
		const [x, y, z] = vertex;

		const newZ = z * Math.cos(radians) - x * Math.sin(radians);
		const newX = z * Math.sin(radians) + x * Math.cos(radians);

		rotated_vertex_table.push([newX, y, newZ]);
	}

	return rotated_vertex_table;
}

function rotateAroundZ(vertex_table, angle) {
	const rotated_vertex_table = [];

	const radians = (angle * Math.PI) / 180;

	for (let vertex of vertex_table) {
		const [x, y, z] = vertex;

		const newX = x * Math.cos(radians) - y * Math.sin(radians);
		const newY = x * Math.sin(radians) + y * Math.cos(radians);

		rotated_vertex_table.push([newX, newY, z]);
	}

	return rotated_vertex_table;
}

function getVertexProjection(vertex_table, viewerPoint, SCREEN_Z) {
	const vertex_projection = [];

	for (let vertex of vertex_table) {
		const x =
			viewerPoint[0] -
			((viewerPoint[2] - SCREEN_Z) * (viewerPoint[0] - vertex[0])) /
				(viewerPoint[2] - vertex[2]);
		const y =
			viewerPoint[1] -
			((viewerPoint[2] - SCREEN_Z) * (viewerPoint[1] - vertex[1])) /
				(viewerPoint[2] - vertex[2]);

		vertex_projection.push([x, y, SCREEN_Z]);
	}

	return vertex_projection;
}

function moveX(vertex_table, shift) {
	return vertex_table.map(vertex => [
		vertex[0] + shift,
		vertex[1],
		vertex[2],
	]);
}

function moveY(vertex_table, shift) {
	return vertex_table.map(vertex => [
		vertex[0],
		vertex[1] + shift,
		vertex[2],
	]);
}

function moveZ(vertex_table, shift) {
	return vertex_table.map(vertex => [
		vertex[0],
		vertex[1],
		vertex[2] + shift,
	]);
}

const camera_X = document.querySelector('#camera_X');
const camera_Y = document.querySelector('#camera_Y');

const rotation_X = document.querySelector('#rotation_X');
const rotation_Y = document.querySelector('#rotation_Y');
const rotation_Z = document.querySelector('#rotation_Z');

const movement_X = document.querySelector('#movement_X');
const movement_Y = document.querySelector('#movement_Y');
const movement_Z = document.querySelector('#movement_Z');

const x_angle = document.querySelector('.x_angle');
const y_angle = document.querySelector('.y_angle');
const z_angle = document.querySelector('.z_angle');

const axes_checkbox = document.querySelector('#axes_checkbox');

const figure_select = document.querySelector('#figure-select');

const coordinates = document.querySelector('.coordinates');

function createDivCoordinates() {
	const div = document.createElement('div');
	div.classList.add('cords');
	coordinates.appendChild(div);

	for (let i = 0; i < figure.vertex_table.length; i++) {
		const divCoordinates = document.createElement('div');
		divCoordinates.classList.add(`coordinates-${i}`);
		divCoordinates.textContent = `[ ${figure.vertex_table[i][0]} ${-figure
			.vertex_table[i][1]} ${figure.vertex_table[i][2]} ]`;
		div.appendChild(divCoordinates);
	}
}

function deleteDivCoordinates() {
	const div = document.querySelector('.cords');
	div?.remove();
}

function getCalculatedCoordinates(figure) {
	let coordinates;
	coordinates = rotateAroundX(figure.vertex_table, rotation_X.value);
	coordinates = rotateAroundY(coordinates, rotation_Y.value);
	coordinates = rotateAroundZ(coordinates, rotation_Z.value);
	coordinates = moveX(coordinates, Number(movement_X.value));
	coordinates = moveY(coordinates, -Number(movement_Y.value));
	coordinates = moveZ(coordinates, Number(movement_Z.value));

	for (let i = 0; i < coordinates.length; i++) {
		const vertex = document.querySelector(`.coordinates-${i}`);
		vertex.textContent = `[ ${Math.round(coordinates[i][0])} ${-Math.round(
			coordinates[i][1]
		)} ${Math.round(coordinates[i][2])} ]`;
	}

	const cameraCoordinates = [camera_X.value, camera_Y.value, CAMERA_Z];

	coordinates = getVertexProjection(coordinates, cameraCoordinates, SCREEN_Z);
	coordinates = shiftCoordinates(coordinates);

	return coordinates;
}

function drawAxes() {
	const cameraCoordinates = [camera_X.value, camera_Y.value, CAMERA_Z];

	ctx.strokeStyle = 'red';
	let projectedAxisX = shiftCoordinates(
		getVertexProjection(axisX.vertex_table, cameraCoordinates, SCREEN_Z)
	);
	drawVertices(projectedAxisX);
	drawEdges(projectedAxisX, axisX.edge_table);

	ctx.strokeStyle = 'green';
	let projectedAxisY = shiftCoordinates(
		getVertexProjection(axisY.vertex_table, cameraCoordinates, SCREEN_Z)
	);
	drawVertices(projectedAxisY);
	drawEdges(projectedAxisY, axisY.edge_table);

	ctx.strokeStyle = 'blue';
	let projectedAxisZ = shiftCoordinates(
		getVertexProjection(axisZ.vertex_table, cameraCoordinates, SCREEN_Z)
	);
	drawVertices(projectedAxisZ);
	drawEdges(projectedAxisZ, axisZ.edge_table);
}

function drawFigure(vertex_table, edge_table) {
	ctx.strokeStyle = '#000000';
	drawVertices(vertex_table);
	drawEdges(vertex_table, edge_table);
}

function drawImage() {
	const coordinates = getCalculatedCoordinates(figure);

	ctx.clearRect(0, 0, 500, 500);

	if (axes_checkbox.checked) drawAxes();

	drawFigure(coordinates, figure.edge_table);
}

function displayAngles() {
	x_angle.textContent = `${rotation_X.value}°`;
	y_angle.textContent = `${rotation_Y.value}°`;
	z_angle.textContent = `${rotation_Z.value}°`;
}

function displayChanges() {
	drawImage();
	displayAngles();
}

rotation_X.addEventListener('input', displayChanges);
rotation_Y.addEventListener('input', displayChanges);
rotation_Z.addEventListener('input', displayChanges);

movement_X.addEventListener('input', displayChanges);
movement_Y.addEventListener('input', displayChanges);
movement_Z.addEventListener('input', displayChanges);

axes_checkbox.addEventListener('input', displayChanges);

camera_X.addEventListener('input', displayChanges);
camera_Y.addEventListener('input', displayChanges);

figure_select.addEventListener('change', () => {
	deleteDivCoordinates();

	if (figure_select.value === 'cube') figure = cube;
	if (figure_select.value === 'pyramid') figure = pyramid;

	createDivCoordinates();
	displayChanges();
});

createDivCoordinates();
displayChanges();