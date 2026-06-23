import * as THREE from "three";
import {
  collectChairSeats,
  computeSeatedViewPose,
  pickStudentChairSeat,
  resolveStudentSeatedPose,
} from "./classroom-seat";

describe("classroom-seat", () => {
  it("places eye above seat surface facing the board", () => {
    const root = new THREE.Group();
    const chair = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.9, 0.5),
      new THREE.MeshBasicMaterial(),
    );
    chair.name = "StudentChair_01";
    chair.position.set(0, 0.45, 2.5);
    root.add(chair);

    const board = new THREE.Vector3(0, 1.8, -3.5);
    const pose = resolveStudentSeatedPose(root, board, 0);

    expect(pose.eye.y).toBeGreaterThan(pose.seat.y);
    expect(pose.eye.z).toBeLessThan(pose.seat.z);
    expect(pose.lookAt.z).toBeLessThan(pose.eye.z);
  });

  it("ignores teacher chairs", () => {
    const root = new THREE.Group();
    const teacherChair = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 1, 0.6),
      new THREE.MeshBasicMaterial(),
    );
    teacherChair.name = "TeacherChair";
    teacherChair.position.set(-2, 0.5, -2);
    root.add(teacherChair);

    expect(collectChairSeats(root)).toHaveLength(0);
  });

  it("picks a back-row center seat", () => {
    const seats = [
      {
        bounds: new THREE.Box3(new THREE.Vector3(-0.2, 0, 1), new THREE.Vector3(0.2, 0.8, 1.4)),
        surface: new THREE.Vector3(0, 0.43, 1.2),
      },
      {
        bounds: new THREE.Box3(new THREE.Vector3(-0.2, 0, 3), new THREE.Vector3(0.2, 0.8, 3.4)),
        surface: new THREE.Vector3(0, 0.43, 3.2),
      },
    ];
    const board = new THREE.Vector3(0, 1.8, -3);
    const picked = pickStudentChairSeat(seats, board);
    expect(picked?.surface.z).toBe(3.2);
  });

  it("offsets eye forward toward the board", () => {
    const seat = new THREE.Vector3(0, 0.45, 2);
    const board = new THREE.Vector3(0, 1.8, -3);
    const pose = computeSeatedViewPose(seat, board, 0);
    expect(pose.eye.z).toBeLessThan(seat.z);
  });
});
