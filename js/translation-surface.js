
/**
 * Functions and primitives for drawing translation surfaces
 *
 */
const TranslationSurface = (function () {

    /**
     * Generates a 3D translation surface
     * @param {Array<Array<number>>} shape an array of 2D positions and an array of 2D normals
     * @param {Array<Array<number>>} path an array of 3D model matrices and an array of 3D normal matrices
     * @returns {Array<number>, Array<number>, Array<number>, Array<number>} 4 WebGL buffers describing position, normals, uv map and indices of the resulting translation surface
     */
    function generate(shape, path) {
        var positionBuffer = [];
        var normalBuffer = [];
        var uvBuffer = [];

        for (let level = 0; level < path.model.length; level++) { // for each level of the path
            for (let part = 0; part < shape.positions.length; part++) { // for each vertex of the 2D shape
                // transform positions
                var shapeVertex = glMatrix.vec4.fromValues(shape.positions[2 * part],
                    shape.positions[2 * part + 1],
                    0,
                    1);
                var surfaceVertex = glMatrix.vec4.create();
                glMatrix.vec4.transformMat4(surfaceVertex, shapeVertex, path.model[level]);
                positionBuffer.push(surfaceVertex[0]);
                positionBuffer.push(surfaceVertex[1]);
                positionBuffer.push(surfaceVertex[2]);

                // transform normals
                var shapeNormal = glMatrix.vec4.fromValues(shape.normales[2 * part],
                    shape.normales[2 * part + 1],
                    0,
                    1);
                var surfaceNormal = glMatrix.vec4.create();
                glMatrix.vec4.transformMat4(surfaceNormal, shapeNormal, path.normales[level]);
                normalBuffer.push(surfaceNormal[0]);
                normalBuffer.push(surfaceNormal[1]);
                normalBuffer.push(surfaceNormal[2]);

                // add UV coordinates
                uvBuffer.push(level / (path.model.length - 1));
                uvBuffer.push(part / (shape.positions.length - 1));
            }
        }

        // Index buffer for the triangles
        var indexBuffer = Geometry.gridIndices(path.model.length - 1, shape.positions.length - 1);
        var buffers = Geometry.createGLBuffers(positionBuffer, normalBuffer, uvBuffer, indexBuffer);
        return new Geometry.Model(buffers.webgl_position_buffer, buffers.webgl_normal_buffer, buffers.webgl_uvs_buffer, buffers.webgl_index_buffer);
    }

    /**
     * Object describing the 2D shape of a regular polygon in the plane (x, y)
     * @type {{ positions: Array<number>, normals: Array<number>}}
     * @param {integer} sides number of sides of the polygon
     * @param {float} radius circumradius of the polygon
     */
    function RegularShape(sides, radius) {
        this.positions = [];
        this.normals = [];

        var angle = 2 * Math.PI / sides;
        var offset = angle / 2 - Math.PI / 2;
        for (let index = 0; index <= sides; index++) {
            let ang = offset + angle * index;
            this.positions.push(Math.cos(ang) * radius);
            this.normals.push(Math.cos(ang));
            this.positions.push(Math.sin(ang) * radius);
            this.normals.push(Math.sin(ang));
        }
    }

    /**
     * Object describing the 3D path of a regular polygon in the plane (x, z)
     * @type {{ model: Array<mat4>, normals: Array<mat4>}}
     * @param {number} sides number of sides of the polygon
     * @param {number} radius circumradius of the polygon
     * @param {number} end number of sides of the generated path
     * @param {boolean} hasLid wether the resulting translation surface should be closed or not
     */
    function RegularPath(sides, radius, end, hasLid = true) {
        this.model = [];
        this.normals = [];

        var angle = 2 * Math.PI / sides;
        var halfPi = Math.PI / 2;
        var offset = angle / 2 - halfPi;
        for (let index = 0; index <= end; index++) {
            let ang = offset + angle * index;

            let modelLevel = glMatrix.mat4.create();
            glMatrix.mat4.rotate(modelLevel, modelLevel, ang, glMatrix.vec3.fromValues(0, 1, 0));
            glMatrix.mat4.translate(modelLevel, modelLevel, glMatrix.vec3.fromValues(0, 0, radius));
            glMatrix.mat4.rotate(modelLevel, modelLevel, halfPi, glMatrix.vec3.fromValues(0, 1, 0));

            let normalsLevel = glMatrix.mat4.create();
            glMatrix.mat4.rotate(normalsLevel, normalsLevel, ang + halfPi, glMatrix.vec3.fromValues(0, 1, 0));

            if (hasLid && (index == 0 || index == end)) {
                let tapa = glMatrix.mat4.clone(modelLevel);
                glMatrix.mat4.scale(tapa, tapa, glMatrix.vec3.fromValues(0, 0, 0));
                if (index == 0) { // initial lid
                    this.model.push(tapa);
                    this.model.push(modelLevel);
                } else { // final lid
                    this.model.push(modelLevel);
                    this.model.push(tapa);
                }
                this.normals.push(normalsLevel);
            } else {
                this.model.push(modelLevel);
            }

            this.normals.push(normalsLevel);
        }
    }

    // PUBLIC
    return {
        generate: generate,
        RegularShape: RegularShape,
        RegularPath: RegularPath
    }
})();