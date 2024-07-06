from mayavi import mlab
import numpy as np
import nibabel as nib

# Caricamento del volume del cervello e del tumore
dir = "C:\\Users\\simon\\Desktop\\Universita\\Tirocinio\\brats2023\\ASNR-MICCAI-BraTS2023-GLI-Challenge-TrainingData\\BraTS-GLI-00000-000\\"
img = nib.load(dir + 'BraTS-GLI-00000-000-t2f.nii.gz')
brain_volume = img.get_fdata()

#mask_volume = nib.load(dir + 'BraTS-GLI-00000-000-seg.nii.gz')
#mask_volume = mask_volume.get_fdata()


mask_volume = np.load('results\prediction.npy')



# Creazione di una mappa di colori per il tumore
colors = {
    0: (0.0, 0.0, 0.0),    # Classe 0: Nero (sfondo)
    1: (1.0, 0.0, 0.0),    # Classe 1: Rosso (tumore)
    2: (0.0, 1.0, 0.0),    # Classe 2: Verde (non utilizzato)
    3: (0.0, 0.0, 1.0)     # Classe 3: Blu (non utilizzato)
}


# Creazione di un oggetto di figura Mayavi
mlab.figure(size=(800, 800), bgcolor=(1, 1, 1))

class_value = 3
#x = 85
surfaces = []


mask = mask_volume == class_value

# Creazione di una superficie isosurfacing per la classe corrente
src = mlab.pipeline.scalar_field(mask.astype(np.float64))
# surf = mlab.pipeline.iso_surface(src, color=color, opacity=1)
surf = mlab.pipeline.iso_surface(src, color=colors[class_value], opacity=1, contours=20)

surfaces.append(surf)


mlab.savefig('results/tumorClass_'+str(class_value)+'.obj', figure=mlab.gcf())


mlab.show()