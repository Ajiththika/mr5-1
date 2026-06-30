"use client";

import { OrbitControls, Environment, Center } from "@react-three/drei";
import { GaneshaModel } from "@/components/3d/GaneshaModel";

export function TeacherAvatarPreviewScene({ modelUrl }: { modelUrl?: string }) {
	return (
		<>
			<ambientLight intensity={0.65} />
			<directionalLight position={[3, 5, 2]} intensity={1.1} />
			<Environment preset="apartment" />
			<Center>
				<GaneshaModel variant="teacher" embedded animate targetHeight={1.72} modelUrl={modelUrl} />
			</Center>
			<OrbitControls enablePan={false} minDistance={1.6} maxDistance={4.2} />
		</>
	);
}
