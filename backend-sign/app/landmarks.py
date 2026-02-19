import cv2
import mediapipe as mp
import numpy as np

mp_holistic = mp.solutions.holistic

POSE_INDEXES = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]


class LandmarkExtractor:
  def __init__(self):
    self.holistic = mp_holistic.Holistic(
      static_image_mode=False,
      model_complexity=1,
      smooth_landmarks=True,
      refine_face_landmarks=False,
    )

  @staticmethod
  def _to_array(landmarks, expected_len):
    if landmarks is None:
      return np.zeros((expected_len, 3), dtype=np.float32)

    arr = np.array([[point.x, point.y, point.z] for point in landmarks.landmark], dtype=np.float32)
    if arr.shape[0] >= expected_len:
      return arr[:expected_len]

    out = np.zeros((expected_len, 3), dtype=np.float32)
    out[:arr.shape[0]] = arr
    return out

  def extract_feature_vector(self, frame_bgr):
    rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    result = self.holistic.process(rgb)

    left_hand = self._to_array(result.left_hand_landmarks, 21)
    right_hand = self._to_array(result.right_hand_landmarks, 21)
    pose_all = self._to_array(result.pose_landmarks, 33)
    pose = pose_all[POSE_INDEXES]

    left_shoulder = pose[0]
    right_shoulder = pose[1]
    center = (left_shoulder + right_shoulder) / 2.0
    scale = np.linalg.norm(left_shoulder - right_shoulder) + 1e-6

    def normalize(points):
      return (points - center) / scale

    feat = np.concatenate([normalize(left_hand), normalize(right_hand), normalize(pose)], axis=0)
    return feat.reshape(-1).astype(np.float32)
