/**
 * Functions and primitives for drawing parametric surfaces
 */
const ParametricSurface = (function () {

    function StrangeBall() {
        this.getPosition = function(alfa, beta) {
            var r = 2;
            var nx = Math.sin(beta) * Math.sin(alfa);
            var ny = Math.sin(beta) * Math.cos(alfa);
            var nz = Math.cos(beta);


            var g = beta % 0.5;
            var h = alfa % 1;
            var f = 1;

            if (g < 0.25) f = 0.95;
            if (h < 0.5) f = f * 0.95;

            var x = nx * r * f;
            var y = ny * r * f;
            var z = nz * r * f;

            return [x, y, z];
        }

        this.getNormal = function(alfa, beta) {
            var p = this.getPosition(alfa, beta);
            var v = vec3.create();
            vec3.normalize(v, p);

            var delta = 0.05;
            var p1 = this.getPosition(alfa, beta);
            var p2 = this.getPosition(alfa, beta + delta);
            var p3 = this.getPosition(alfa + delta, beta);

            var v1 = vec3.fromValues(p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]);
            var v2 = vec3.fromValues(p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]);

            vec3.normalize(v1, v1);
            vec3.normalize(v2, v2);

            var n = vec3.create();
            vec3.cross(n, v1, v2);
            vec3.scale(n, n, -1);
            return n;
        }
    }

    function generateCartesian(surface, rows, columns) {
        positionBuffer = [];
        normalBuffer = [];
        uvBuffer = [];

        for (var i=0; i <= rows; i++) {
            for (var j=0; j <= columns; j++) {

                var u=j/columns;
                var v=i/rows;

                var pos=surface.getPosition(u,v);

                positionBuffer.push(pos[0]);
                positionBuffer.push(pos[1]);
                positionBuffer.push(pos[2]);

                var nrm=surface.getNormal(u,v);

                normalBuffer.push(nrm[0]);
                normalBuffer.push(nrm[1]);
                normalBuffer.push(nrm[2]);

                var uvs=surface.getCoordenadasTextura(u,v);

                uvBuffer.push(uvs[0]);
                uvBuffer.push(uvs[1]);

            }
        }

        index = Geometry.gridIndices(rows-1, columns-1);
    }

    function generateSpherical(surface, rows, columns) {
        var pos = [];
        var normal = [];
        var index = [];

        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < columns; j++) {

                var alfa = j / (columns - 1) * Math.PI * 2;
                var beta = (0.1 + i / (rows - 1) * 0.8) * Math.PI;

                var p = surface.getPosition(alfa, beta);

                pos.push(p[0]);
                pos.push(p[1]);
                pos.push(p[2]);

                var n = surface.getNormal(alfa, beta);

                normal.push(n[0]);
                normal.push(n[1]);
                normal.push(n[2]);
            }

        }
        
        index = Geometry.gridIndices(rows-1, columns-1);

        return {pos, normal, index};
    }

    return {
        StrangeBall: StrangeBall,
        generateCartesian: generateCartesian,
        generateSpherical: generateSpherical
    }

})();