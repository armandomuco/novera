import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type KnowledgeTwinCanvasProps = {
  title?: string;
  subtitle?: string;
  domainLabels?: string[];
  liveContextLabel?: string;
  linkedDomainsLabel?: string;
};

export function KnowledgeTwinCanvas({
  title = 'Business twin',
  subtitle = 'Live knowledge map',
  domainLabels = ['Projects', 'Docs', 'Decisions', 'Risks', 'Team', 'Customers'],
  liveContextLabel = 'Live context',
  linkedDomainsLabel = '6 domains linked',
}: KnowledgeTwinCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.05, 10.2);

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
    group.position.set(-2.05, 0.78, 0);
    group.scale.setScalar(0.72);
    scene.add(group);

    const nodeGeometry = new THREE.SphereGeometry(0.12, 32, 32);
    const smallNodeGeometry = new THREE.SphereGeometry(0.045, 16, 16);
    const coreGeometry = new THREE.DodecahedronGeometry(0.42, 1);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0f766e, transparent: true, opacity: 0.46 });
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0x134e4a,
      emissive: 0x0f766e,
      emissiveIntensity: 0.12,
      roughness: 0.32,
      metalness: 0.28,
    });
    const nodeMaterials = [0x2563eb, 0x0f766e, 0xf59e0b, 0x7c3aed, 0xdc2626, 0x0891b2].map(
      (color) =>
        new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.08,
          roughness: 0.3,
          metalness: 0.16,
        }),
    );
    const orbitMaterial = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
    });
    const satelliteMaterial = new THREE.MeshBasicMaterial({ color: 0x14b8a6, transparent: true, opacity: 0.72 });

    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    group.add(core);

    const points = [
      new THREE.Vector3(-1.62, 0.92, 0.22),
      new THREE.Vector3(1.62, 0.84, -0.18),
      new THREE.Vector3(-1.38, -1.02, -0.12),
      new THREE.Vector3(1.44, -1.0, 0.28),
      new THREE.Vector3(0, 1.46, -0.32),
      new THREE.Vector3(0.1, -1.48, -0.28),
    ];

    points.forEach((point, index) => {
      const node = new THREE.Mesh(nodeGeometry, nodeMaterials[index]);
      node.position.copy(point);
      group.add(node);

      const lineGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), point]);
      group.add(new THREE.Line(lineGeometry, lineMaterial));

      const satellite = new THREE.Mesh(smallNodeGeometry, satelliteMaterial);
      satellite.position.set(point.x * 1.14, point.y * 1.14, point.z + 0.16);
      group.add(satellite);
    });

    [1.12, 1.62, 2.05].forEach((radius, index) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.006, 8, 96), orbitMaterial);
      ring.rotation.x = Math.PI / 2.25;
      ring.rotation.z = index * 0.7;
      group.add(ring);
    });

    const ambient = new THREE.AmbientLight(0xffffff, 1.6);
    const key = new THREE.DirectionalLight(0xffffff, 2.7);
    key.position.set(2, 3, 4);
    const rim = new THREE.DirectionalLight(0x67e8f9, 1.4);
    rim.position.set(-3, -1, 3);
    scene.add(ambient, key, rim);

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
      group.rotation.y += 0.0024;
      group.rotation.x = Math.sin(frame) * 0.055;
      core.rotation.x += 0.005;
      core.rotation.y += 0.007;
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
      smallNodeGeometry.dispose();
      coreGeometry.dispose();
      lineMaterial.dispose();
      coreMaterial.dispose();
      orbitMaterial.dispose();
      satelliteMaterial.dispose();
      nodeMaterials.forEach((material) => material.dispose());
      container.removeChild(renderer.domElement);
    };
  }, []);

  const labels = [
    [domainLabels[0], 'left-[8%] top-[36%] border-blue-200 bg-blue-50 text-blue-800'],
    [domainLabels[1], 'right-[12%] top-[34%] border-teal-200 bg-teal-50 text-teal-800'],
    [domainLabels[2], 'left-[18%] bottom-[18%] border-amber-200 bg-amber-50 text-amber-800'],
    [domainLabels[3], 'right-[19%] bottom-[22%] border-red-200 bg-red-50 text-red-800'],
    [domainLabels[4], 'left-1/2 top-[12%] -translate-x-1/2 border-violet-200 bg-violet-50 text-violet-800'],
    [domainLabels[5], 'left-1/2 bottom-[9%] -translate-x-1/2 border-cyan-200 bg-cyan-50 text-cyan-800'],
  ];

  return (
    <div className="relative h-80 overflow-hidden rounded-ui border border-line bg-white shadow-sm">
      <div className="absolute inset-0 bg-[linear-gradient(#e2e8f0_1px,transparent_1px),linear-gradient(90deg,#e2e8f0_1px,transparent_1px)] bg-[size:32px_32px] opacity-35" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.16),transparent_58%)]" />
      <div ref={containerRef} className="absolute inset-0 min-h-72" />
      {labels.map(([label, className]) => (
        <span
          key={label}
          className={`absolute rounded-full border px-2.5 py-1 text-[11px] font-bold shadow-sm ${className}`}
        >
          {label}
        </span>
      ))}
      <div className="absolute left-4 top-4 rounded-ui border border-slate-200 bg-white/90 px-3 py-2 backdrop-blur">
        <p className="text-xs font-semibold uppercase text-slate-500">{title}</p>
        <p className="text-sm font-bold text-ink">{subtitle}</p>
      </div>
      <div className="absolute right-4 top-4 rounded-ui border border-slate-200 bg-white/95 px-3 py-2 text-right shadow-sm backdrop-blur">
        <p className="text-xs font-semibold uppercase text-slate-500">{liveContextLabel}</p>
        <p className="text-sm font-bold text-ink">{linkedDomainsLabel}</p>
      </div>
    </div>
  );
}
