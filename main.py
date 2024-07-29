import numpy as np
import nibabel as nib
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
import segmentation_models_3D as sm
import keras
import tensorflow as tf
from model.loadModel import loadWeight
from model_3d.brain_tumor import createBrain
import sys
import io

# Imposta la codifica della console su UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
scaler = MinMaxScaler()

def load_data(t2, flair, t1ce):
    '''
    Load the required data and stack them to a single numpy array
    '''
    temp_image_t2 = nib.load(t2).get_fdata()
    temp_image_t2 = scaler.fit_transform(temp_image_t2.reshape(-1, temp_image_t2.shape[-1])).reshape(temp_image_t2.shape)

    temp_image_flair = nib.load(flair).get_fdata()
    temp_image_flair = scaler.fit_transform(temp_image_flair.reshape(-1, temp_image_flair.shape[-1])).reshape(temp_image_flair.shape)

    temp_image_t1ce = nib.load(t1ce).get_fdata()
    temp_image_t1ce = scaler.fit_transform(temp_image_t1ce.reshape(-1, temp_image_t1ce.shape[-1])).reshape(temp_image_t1ce.shape)

    temp_combined_images = np.stack([temp_image_flair, temp_image_t1ce, temp_image_t2], axis = 3)
    
    temp_combined_images = temp_combined_images[:,:,:144]
    
    return temp_combined_images

def main(t2, flair, t1ce):

    model = loadWeight()

    img = load_data(t2, flair, t1ce)
    img_input = np.expand_dims(img, axis=0)
    print(img_input.shape)
    prediction = model.predict(img_input)
    print(prediction.shape)
    prediction_argmax=np.argmax(prediction, axis=4)[0,:,:,:]

    #CHIAMA IL FILE PER LA CREAZIONE DEL MODELLO 3D
    np.save('../results/prediction.npy', prediction_argmax)
    
    print('creating brain model...')
    createBrain(t2, prediction_argmax)
    print('brain model created')

if __name__ == "__main__":
    print("Script invoked directly")  # Debugging print
    sys.stdout.flush()

    if len(sys.argv) != 4:
        print("Usage: script.py <t2> <flair> <t1ce>")
        sys.stdout.flush()
        sys.exit(1)

    t2 = sys.argv[1]
    flair = sys.argv[2]
    t1ce = sys.argv[3]
    
    t2 = t2.replace('\\', '/')
    flair = flair.replace('\\', '/')
    t1ce = t1ce.replace('\\', '/')

    sys.stdout.flush()

    main(t2, flair, t1ce)

'''
t2 = "C:/Users/simon/Desktop/Universita/Tirocinio/brats2023/ASNR-MICCAI-BraTS2023-GLI-Challenge-TrainingData/BraTS-GLI-00000-000/BraTS-GLI-00000-000-t2w.nii.gz"
flair = "C:/Users/simon/Desktop/Universita/Tirocinio/brats2023/ASNR-MICCAI-BraTS2023-GLI-Challenge-TrainingData/BraTS-GLI-00000-000/BraTS-GLI-00000-000-t2f.nii.gz"
t1ce = "C:/Users/simon/Desktop/Universita/Tirocinio/brats2023/ASNR-MICCAI-BraTS2023-GLI-Challenge-TrainingData/BraTS-GLI-00000-000/BraTS-GLI-00000-000-t1c.nii.gz"
main(t2, flair, t1ce)
'''