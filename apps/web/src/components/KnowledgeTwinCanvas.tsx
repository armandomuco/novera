import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type KnowledgeTwinCanvasProps = {
  title?: string;
  subtitle?: string;
};

export function KnowledgeTwinCanvas({
  title = 'Business twin',
  subtitle = 'Live knowledge map',
}: KnowledgeTwinCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    camera.position.set(0, 0, 6.5);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      container.dataset.fallback = 'true';
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const nodeGeometry = new THREE.SphereGeometry(0.16, 24, 24);
    const coreGeometry = new THREE.IcosahedronGeometry(0.48, 1);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x2563eb, transparent: true, opacity: 0.48 });
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f766e,
      roughness: 0.38,
      metalness: 0.18,
    });
    const nodeMaterial = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      roughness: 0.34,
      metalness: 0.12,
    });

    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    group.add(core);

    const points = [
      new THREE.Vector3(-1.8, 1.1, 0.4),
      new THREE.Vector3(1.7, 1, -0.2),
      new THREE.Vector3(-1.5, -1.2, -0.1),
      new THREE.Vector3(1.55, -1.1, 0.35),
      new THREE.Vector3(0, 1.85, -0.45),
      new THREE.Vector3(0.1, -1.9, -0.35),
    ];

    points.forEach((point) => {
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      node.position.copy(point);
      group.add(node);

      const lineGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), point]);
      group.add(new THREE.Line(lineGeometry, lineMaterial));
    });

    const ambient = new THREE.AmbientLight(0xffffff, 1.8);
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(2, 3, 4);
    scene.add(ambient, key);

    let frame = 0;
    let animationId = 0;

    function resize() {
      const width = containerRef.current?.clientWidth ?? 1;
      const height = containerRef.current?.clientHeight ?? 1;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    function animate() {
      frame += 0.01;
      group.rotation.y += 0.004;
      group.rotation.x = Math.sin(frame) * 0.08;
      core.rotation.x += 0.006;
      core.rotation.y += 0.008;
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    }

    resize();
    animate();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      nodeGeometry.dispose();
      coreGeometry.dispose();
      lineMaterial.dispose();
      coreMaterial.dispose();
      nodeMaterial.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="relative h-72 overflow-hidden rounded-ui border border-line bg-[radial-gradient(circle_at_center,#ecfeff_0,#ffffff_48%,#f8fafc_100%)] shadow-sm">
      <div ref={containerRef} className="absolute inset-0 min-h-72" />
      <div className="absolute inset-x-8 bottom-8 h-px bg-gradient-to-r from-transparent via-signal to-transparent opacity-40" />
      <div className="absolute left-4 top-4 rounded-ui border border-slate-200 bg-white/90 px-3 py-2 backdrop-blur">
        <p className="text-xs font-semibold uppercase text-slate-500">{title}</p>
        <p className="text-sm font-bold text-ink">{subtitle}</p>
      </div>
    </div>
  );
}
