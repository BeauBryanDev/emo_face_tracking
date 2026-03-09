import cv2
import numpy as np

def draw_geometry_overlay(frame, landmarks, geometry):

    if landmarks is None:
        return frame

    landmarks = np.array(landmarks, dtype=int)

    # draw facial keypoints
    for (x, y) in landmarks:
        cv2.circle(frame, (x, y), 3, (0,255,255), -1)

    # draw eye line
    cv2.line(frame,
        tuple(landmarks[0]),
        tuple(landmarks[1]),
        (255,0,255), 2
    )

    # draw mouth line
    cv2.line(frame,
        tuple(landmarks[3]),
        tuple(landmarks[4]),
        (255,255,0), 2
    )

    ear = geometry["ear"]["ear"]
    mar = geometry["mar"]["mar"]
    pose = geometry["head_pose"]["pose_label"]

    text = f"EAR:{ear:.2f}  MAR:{mar:.2f}  Pose:{pose}"

    cv2.putText(
        frame,
        text,
        (20,30),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        (0,255,0),
        2
    )

    return frame
