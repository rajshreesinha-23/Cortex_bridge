import numpy as np


class SessionBuffer:
  def __init__(self, window=32, feat_dim=162):
    self.window = window
    self.feat_dim = feat_dim
    self._store = {}

  def push(self, session_id, feat):
    queue = self._store.get(session_id, [])
    queue.append(feat)
    if len(queue) > self.window:
      queue = queue[-self.window:]
    self._store[session_id] = queue

  def get_window(self, session_id):
    queue = self._store.get(session_id, [])
    if not queue:
      return np.zeros((self.window, self.feat_dim), dtype=np.float32)

    arr = np.stack(queue, axis=0)
    if arr.shape[0] < self.window:
      pad = np.repeat(arr[-1][None, :], self.window - arr.shape[0], axis=0)
      arr = np.concatenate([pad, arr], axis=0)
    return arr.astype(np.float32)
