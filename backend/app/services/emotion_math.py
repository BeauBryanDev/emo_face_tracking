import numpy as np

def compute_entropy(probabilities: list[float]) -> float:
    """
    Compute Shannon entropy for a probability distribution.
    """

    p = np.array(probabilities)

    # avoid log(0)
    p = p[p > 0]

    entropy = -np.sum(p * np.log(p))

    return float(entropy)


def calculate_russell_coordinates(probabilities):
    """
    Converts probability vector (8 emotions) to Russell coordinates (X, Y).
    Expected order: [Happiness, Surprise, Contempt, Neutral, Disgust, Fear, Anger, Sadness]
    """
    # 1. Define Valence (X) and Arousal (Y) weights for each emotion
    # These values are normalized between -1 and 1
    weights = {
        # Emotion: (Valence, Arousal)
        "Happiness": (0.8,  0.6),
        "Surprise":  (0.3,  0.8),
        "Contempt":  (-0.5, 0.2),
        "Neutral":   (0.0,  0.0),
        "Disgust":   (-0.7, 0.2),
        "Fear":      (-0.6, 0.7),
        "Anger":     (-0.7, 0.8),
        "Sadness":   (-0.8, -0.6)
    }
    
    # Convert weights to numpy arrays for fast calculation
    valencia_weights = np.array([v[0] for v in weights.values()])
    arousal_weights = np.array([v[1] for v in weights.values()])
    
    # 2. Weighted average calculation (Dot Product)
    # This prevents sudden jumps and smooths the time series
    x_coord = np.dot(probabilities, valencia_weights)
    y_coord = np.dot(probabilities, arousal_weights)
    
    return round(x_coord, 4), round(y_coord, 4)
