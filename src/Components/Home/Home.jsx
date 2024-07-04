import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron, Sphere, Text, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import Navbar from "../Navbar/Navbar";
import { Link } from 'react-router-dom';
import "./Home.css";

const relationship_map = {
    "threat-actor": { "identity": ["attributed-to"], "attack-pattern": ["uses"], "malware": ["uses"], "tool": ["uses"], "vulnerability": ["targets"] },
    "identity": { "threat-actor": ["attributed-to"], "campaign": ["attributed-to", "targets"] },
    "malware": { "vulnerability": ["exploits"], "tool": ["uses"], "attack-pattern": ["uses"], "campaign": ["originates-from"], "threat-actor": ["authored-by"] },
    "indicator": { "campaign": ["indicates"], "malware": ["indicates"], "threat-actor": ["indicates"], "tool": ["indicates"], "intrusion-set": ["indicates"] },
    "campaign": { "threat-actor": ["attributed-to"], "intrusion-set": ["attributed-to"], "identity": ["targets"], "vulnerability": ["targets"], "tool": ["uses"], "malware": ["uses"] },
    "intrusion-set": { "campaign": ["part-of"], "threat-actor": ["attributed-to"] },
    "tool": { "threat-actor": ["uses"], "malware": ["uses"] },
    "course-of-action": { "indicator": ["investigates", "mitigates"], "observed-data": ["based-on"], "attack-pattern": ["mitigates"], "malware": ["remediates"], "vulnerability": ["remediates"], "tool": ["mitigates"] },
    "location": { "identity": ["located-at"], "threat-actor": ["located-at"], "campaign": ["originates-from", "targets"], "malware": ["originates-from"], "intrusion-set": ["originates-from", "targets"], "attack-pattern": ["targets"], "tool": ["targets"] },
    "infrastructure": { "threat-actor": ["compromised-by"], "infrastructure": ["consists-of"], "tool": ["hosts"], "malware": ["hosts"], "campaign": ["used-by", "hosts"] },
    "opinion": { "indicator": ["related-to"], "threat-actor": ["related-to"], "attack-pattern": ["related-to"], "campaign": ["related-to"], "incident": ["related-to"], "malware": ["related-to"], "tool": ["related-to"], "vulnerability": ["related-to"], "infrastructure": ["related-to"], "intrusion-set": ["related-to"], "malware-analysis": ["related-to"], "threat-report": ["related-to"], "identity": ["related-to"] },
    "observed-data": { "indicator": ["based-on"], "threat-actor": ["observed-in"], "attack-pattern": ["observed-in"], "campaign": ["observed-in"], "incident": ["observed-in"], "malware": ["observed-in"], "tool": ["observed-in"], "vulnerability": ["observed-in"], "infrastructure": ["observed-in"], "intrusion-set": ["observed-in"], "malware-analysis": ["observed-in"], "threat-report": ["observed-in"], "identity": ["observed-in"] },
};

function Node({ position, label }) {
    const ref = useRef();

    useFrame(({ clock }) => {
        if (ref.current) {
            const t = Math.sin(clock.elapsedTime * 2 + THREE.MathUtils.randFloat(0, Math.PI)) * 0.1;
            ref.current.scale.setScalar(0.5 + t);
        }
    });

    return (
        <group position={position}>
            <Sphere ref={ref} args={[0.015, 16, 16]}>
                <meshBasicMaterial color="#00ffff" />
            </Sphere>
            <Text
                position={[0, 0.03, 0]}
                fontSize={0.03}
                color="#00ffff"
                anchorX="center"
                anchorY="middle"
                depthOffset={1}
                renderOrder={2}
            >
                {label}
            </Text>
        </group>
    );
}

function Earth() {
    const meshRef = useRef();

    const nodes = useMemo(() => {
        return Object.keys(relationship_map).map((key, index) => {
            const phi = Math.acos(-1 + (2 * index) / Object.keys(relationship_map).length);
            const theta = Math.sqrt(Object.keys(relationship_map).length * Math.PI) * phi;
            const position = new THREE.Vector3(
                Math.cos(theta) * Math.sin(phi),
                Math.sin(theta) * Math.sin(phi),
                Math.cos(phi)
            );
            return { position: position.multiplyScalar(1.1), label: key };
        });
    }, []);

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.001;
        }
    });

    return (
        <group ref={meshRef}>
            <Icosahedron args={[1, 4]}>
                <meshPhongMaterial
                    color="#1a1a2e"
                    emissive="#00ffff"
                    emissiveIntensity={0.2}
                    wireframe={true}
                />
            </Icosahedron>
            {nodes.map((node, index) => (
                <Node key={index} position={node.position} label={node.label} />
            ))}
        </group>
    );
}

const Home = () => {
    return (
        <div className="home">
            <Navbar />
            <div className="hero">
                <div className="hero-content">
                    <h1>Welcome to<br />Synthetica</h1>
                    <h2>Synthetic Threat Intelligence Data Generator</h2>
                    <p>Explore the complex world of cyber security through our interactive knowledge graph. Dive into relationships, threats, and insights with ease.</p>
                    <Link to="/entitySelector">
                        <button className="cta-button">START GENERATING</button>
                    </Link>

                </div>
                <div className="hero-image">
                    <Canvas>
                        <PerspectiveCamera makeDefault position={[0, 0, 2.5]} />
                        <ambientLight intensity={0.5} />
                        <pointLight position={[10, 10, 10]} />
                        <Earth />
                    </Canvas>
                </div>
            </div>
        </div>
    );
};

export default Home;