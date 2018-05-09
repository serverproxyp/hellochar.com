import * as THREE from "three";

import { logistic } from "../../../math";
import { Component } from "../component";
import { LeafTemplate } from "../veinMesh/leafTemplate";
import { VeinBone, VeinedLeafSkeleton } from "../veinMesh/veinedLeafSkeleton";

// what do I want to say?
// leaf feeds the petiole
// petiole feeds the lamina

export class Leaf extends Component {
    public lamina: THREE.SkinnedMesh;
    constructor(template: LeafTemplate) {
        super();
        const petioleLength = 0.5;
        if (petioleLength > 0) {
            const petiole = (() => {
                // const geom = new THREE.PlaneGeometry(1, 0.1);
                const mat = new THREE.MeshLambertMaterial({
                    color: "green",
                    side: THREE.DoubleSide,
                });
                const geom = new THREE.BoxBufferGeometry(petioleLength, 0.01, 0.04);
                // geom.rotateX(-Math.PI / 2);
                geom.translate(petioleLength / 2, 0, 0);
                const petioleMesh = new THREE.Mesh(
                    geom,
                    mat,
                );
                petioleMesh.castShadow = true;
                petioleMesh.receiveShadow = true;
                return petioleMesh;
            })();
            this.add(petiole);
        }
        this.lamina = template.instantiateLeaf();
        this.lamina.position.x = petioleLength;
        this.add(this.lamina);
    }

    updateSelf(t: number) {
        const logisticX = (t - this.timeBorn) / 1000 - 6;
        const s = logistic(logisticX);
        // const s = 1;
        this.scale.set(s, s, s);
        for (const bone of this.lamina.skeleton.bones) {
            // bone.rotation.z = THREE.Math.randFloat(-1, 1) * 0.01;
            // bone.rotation.x = THREE.Math.randFloat(-1, 1) * 0.01;
        }

        // leafMesh.rotation.x += 0.01;
        for (const boneUncast of this.lamina.skeleton.bones) {
            // HACKHACK make this based off physics instead
            const bone = boneUncast as VeinBone;
            const skeleton = this.lamina.skeleton as VeinedLeafSkeleton;
            // curl the leaves
            let { x, y: z } = bone.vein.position;
            x *= skeleton.downScalar;
            z *= skeleton.downScalar;
            const len = Math.sqrt(x * x + z * z);
            bone.rotation.z = (0.003 * Math.sin(t / 2000) - Math.abs(z) * 0.5 + Math.abs(x) * 0.01) * len;

            // TODO make the position integrate to a log(1+x) look properly
            const t2 = Math.abs(z) * 40 - 6;
            const pos = logistic(t2) * ( 1 - logistic(t2)) * 0.01;
            bone.position.y = -pos;
            // bone.rotation.y = 0.1 / (1 + Math.abs(z) * 10);
        }
    }

    static generate(template: LeafTemplate) {
        return new Leaf(template);
    }
}