// written by Claude Opus 4.5
// Prompt:
// A simple robot arm is defined with its root at the origin. It has two rigid segments that extend 20 units along the X axis. The robot's parameters are two angles, theta1 and theta2, when theta1 and theta2 are zero, the robot extends along the X axis with its end effector at 40,0
// write a simple pure javascript function that takes theta1 and theta 2 as parameters and returns [x,y] of the end effector
// write a pure javascript function that computes the inverse kinematics of the robot, returning [theta1, theta1] as a function of x,y. if x,y is father than 40 units, have the robot fully extended pointing towards the point. when there are multiple solutions, the program should pick one, in a consistent manner. for example, preferring positive theta1 values

// Forward kinematics: given angles, return end effector position
export function forwardKinematics(theta1, theta2) {
  const L = 20;
  const x1 = L * Math.cos(theta1);
  const y1 = L * Math.sin(theta1);
  const x = x1 + L * Math.cos(theta1 + theta2);
  const y = y1 + L * Math.sin(theta1 + theta2);
  return [x, y];
}

// Inverse kinematics: given position, return angles
export function inverseKinematics(x, y) {
  const L = 20;
  const d = Math.sqrt(x * x + y * y);
  
  // If out of reach, point towards target fully extended
  if (d >= 2 * L) {
    const theta1 = Math.atan2(y, x);
    return [theta1, 0];
  }
  
  // Law of cosines for theta2
  const cosTheta2 = (d * d - 2 * L * L) / (2 * L * L);
  const theta2 = -Math.acos(Math.max(-1, Math.min(1, cosTheta2)));
  
  // Solve for theta1
  const k1 = L + L * Math.cos(theta2);
  const k2 = L * Math.sin(theta2);
  const theta1 = Math.atan2(y, x) - Math.atan2(k2, k1);
  
  return [theta1, theta2];
}

// Get joint position (elbow)
export function getJointPosition(theta1) {
  const L = 20;
  return [L * Math.cos(theta1), L * Math.sin(theta1)];
}
