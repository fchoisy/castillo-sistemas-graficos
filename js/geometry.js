
/**
 * Common utility functions for drawing 3D objects
 */
const Geometry = (function () {

    function Model(positionBuffer, normalBuffer, uvBuffer, indexBuffer) {
        this.positionBuffer = positionBuffer;
        this.normalBuffer = normalBuffer;
        this.uvBuffer = uvBuffer;
        this.indexBuffer = indexBuffer;
    }

    function Object3D(model, modelMatrix) {
        this.model = model;
        this.modelMatrix = modelMatrix;
        this.children = [];
        this.draw = function(gl, glProgram) {
            for (const child of this.children) {
                child.draw();
            }
            var modelMatrixUniform = gl.getUniformLocation(glProgram, "modelMatrix");
            var viewMatrixUniform = gl.getUniformLocation(glProgram, "viewMatrix");
            var projMatrixUniform = gl.getUniformLocation(glProgram, "projMatrix");
            var normalMatrixUniform = gl.getUniformLocation(glProgram, "normalMatrix");

            gl.uniformMatrix4fv(modelMatrixUniform, false, this.modelMatrix);
            gl.uniformMatrix4fv(viewMatrixUniform, false, viewMatrix);
            gl.uniformMatrix4fv(projMatrixUniform, false, projMatrix);
            gl.uniformMatrix4fv(normalMatrixUniform, false, normalMatrix);

            var vertexPositionAttribute = gl.getAttribLocation(glProgram, "aVertexPosition");
            gl.enableVertexAttribArray(vertexPositionAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.model.positionBuffer);
            gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

            var vertexNormalAttribute = gl.getAttribLocation(glProgram, "aVertexNormal");
            gl.enableVertexAttribArray(vertexNormalAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.model.normalBuffer);
            gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.model.indexBuffer);
            gl.drawElements(gl.TRIANGLE_STRIP, this.model.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        }
    }

    /**
     * Returns the indices to draw a grid of quads
     * using 1 single TRIANGLE_STRIP instruction.
     * @param {number} rows number of rows in the grid
     * @param {number} columns number of quads per row
     * @returns {Array<number>} array of indices
     */
    function gridIndices(rows, columns) {
        var indexBuffer = [];
        for (i = 0; i < rows; i++) {
            for (j = 0; j <= columns; j++) {
                // vertex of the UPPER edge of the row
                indexBuffer.push(i * (columns + 1) + j);
                // vertex of the LOWER edge of the row
                indexBuffer.push((i + 1) * (columns + 1) + j);
            }
            // At the end of every row (except the last one),
            // duplicate vertices in order to append the next row
            if (i < rows - 2) {
                // LAST vertex of the lower edge of the row
                indexBuffer.push((i + 1) * (columns + 1) + columns);
                // FIRST vertex of the lower edge of the row
                // (= first vertex of the upper edge of the next row)
                indexBuffer.push((i + 1) * (columns + 1));
            }
        }
        return indexBuffer;
    }

    /**
     * Create and fill WebGL buffers
     * @param {Array<number>} positionBuffer 
     * @param {Array<number>} normalBuffer 
     * @param {Array<number>} uvBuffer 
     * @param {Array<number>} indexBuffer 
     */
    function createGLBuffers(positionBuffer, normalBuffer, uvBuffer, indexBuffer) {

        webgl_position_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, webgl_position_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionBuffer), gl.STATIC_DRAW);
        webgl_position_buffer.itemSize = 3;
        webgl_position_buffer.numItems = positionBuffer.length / 3;

        webgl_normal_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, webgl_normal_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalBuffer), gl.STATIC_DRAW);
        webgl_normal_buffer.itemSize = 3;
        webgl_normal_buffer.numItems = normalBuffer.length / 3;

        webgl_uvs_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, webgl_uvs_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvBuffer), gl.STATIC_DRAW);
        webgl_uvs_buffer.itemSize = 2;
        webgl_uvs_buffer.numItems = uvBuffer.length / 2;

        webgl_index_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webgl_index_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexBuffer), gl.STATIC_DRAW);
        webgl_index_buffer.itemSize = 1;
        webgl_index_buffer.numItems = indexBuffer.length;

        return {
            webgl_position_buffer,
            webgl_normal_buffer,
            webgl_uvs_buffer,
            webgl_index_buffer
        }
    }

    return {
        Model: Model,
        Object3D: Object3D,
        gridIndices: gridIndices,
        createGLBuffers: createGLBuffers,
    }
})();