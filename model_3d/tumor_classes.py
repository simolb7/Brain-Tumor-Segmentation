from mayavi import mlab
import numpy as np
import nibabel as nib
import sys

mlab.options.offscreen = True

def createClass(class_value):
    
    '''
    Create the 3d model for each class of the tumor, create an obj file for the model and mtl file for the material
    '''

    mask_volume = np.load('../results/prediction.npy')

    # Creazione di una mappa di colori per il tumore
    colors = {
        0: (0.0, 0.0, 0.0),    # Classe 0: Nero (sfondo)
        1: (1.0, 0.0, 0.0),    # Classe 1: Rosso (tumore)
        2: (0.0, 1.0, 0.0),    # Classe 2: Verde (non utilizzato)
        3: (0.0, 0.0, 1.0)     # Classe 3: Blu (non utilizzato)
    }

    # Creazione di un oggetto di figura Mayavi
    mlab.figure(size=(800, 800), bgcolor=(1, 1, 1))

    surfaces = []

    mask = mask_volume == class_value

    # Creazione di una superficie isosurfacing per la classe corrente
    src = mlab.pipeline.scalar_field(mask.astype(np.float64))
    # surf = mlab.pipeline.iso_surface(src, color=color, opacity=1)
    surf = mlab.pipeline.iso_surface(src, color=colors[class_value], opacity=1, contours=20)

    surfaces.append(surf)

    mlab.savefig('../results/tumorClass_'+str(class_value)+'.obj', figure=mlab.gcf())

    mlab.show()
    
if __name__ == "__main__":
    print("Script invoked directly")  # Debugging print
    sys.stdout.flush()
    
    if len(sys.argv) != 2:
        sys.stdout.flush()
        sys.exit(1)

    value = sys.argv[1]
    createClass(int(value))
