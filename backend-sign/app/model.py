import torch
import torch.nn as nn


class SignTransformer(nn.Module):
  def __init__(self, input_dim=162, d_model=256, nhead=8, layers=4, num_classes=100):
    super().__init__()
    self.proj = nn.Linear(input_dim, d_model)
    encoder_layer = nn.TransformerEncoderLayer(
      d_model=d_model,
      nhead=nhead,
      batch_first=True,
      dropout=0.1,
    )
    self.encoder = nn.TransformerEncoder(encoder_layer, num_layers=layers)
    self.classifier = nn.Sequential(
      nn.LayerNorm(d_model),
      nn.Linear(d_model, num_classes),
    )

  def forward(self, x):
    # x shape: [batch, time, features]
    x = self.proj(x)
    z = self.encoder(x)
    z = z.mean(dim=1)
    return self.classifier(z)
