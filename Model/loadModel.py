import tensorflow as tf
import segmentation_models_3D as sm
import numpy as np
import keras

# Definisci i pesi delle classi per DiceLoss
wt0, wt1, wt2, wt3 = 0.25,0.25,0.25,0.25
dice_loss = sm.losses.DiceLoss(class_weights=np.array([wt0, wt1, wt2, wt3]))
focal_loss = sm.losses.CategoricalFocalLoss()
total_loss = dice_loss + (1 * focal_loss)

metrics = ['accuracy', sm.metrics.IOUScore(threshold=0.5)]

LR = 0.0001
optim = keras.optimizers.Adam(LR)

# Funzione wrapper per la perdita combinata
def dice_loss_plus_1focal_loss():
    return dice_loss + (1 * focal_loss)

# Funzione per ricostruire SumOfLosses
def sum_of_losses_from_config(config):
    return dice_loss_plus_1focal_loss()

# Funzione per ricostruire IOUScore
def iou_score_from_config(config):
    return sm.metrics.IOUScore(threshold=0.5)

# Mappa dei tuoi oggetti personalizzati
custom_objects = {
    'DiceLoss': sm.losses.DiceLoss,
    'CategoricalFocalLoss': sm.losses.CategoricalFocalLoss,
    'SumOfLosses': sum_of_losses_from_config,  # Simula il metodo from_config
    'dice_loss_plus_1focal_loss': dice_loss_plus_1focal_loss,
    'IOUScore': iou_score_from_config,  # Simula il metodo from_config
    'Adam': keras.optimizers.Adam,
}

# Carica il modello salvato
model = tf.keras.models.load_model(
    "C:\\Users\\simon\\Desktop\\Universita\\Tirocinio\\50epoch\\saved_model.keras",
    custom_objects=custom_objects
)