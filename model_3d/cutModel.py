import sys
import io

# Imposta la codifica della console su UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print("Script started")  # Debugging print
sys.stdout.flush()

# Import dei moduli
try:
    from mayavi import mlab
    import numpy as np
    import nibabel as nib
    import os
    print("Imports successful")  # Debugging print
    sys.stdout.flush()
except Exception as e:
    print(f"Error importing modules: {e}")
    sys.stdout.flush()
    sys.exit(1)

mlab.options.offscreen = True

def main(t2, axis, value):
    '''
    Create the 3d model of the tumor, create an obj file and mtl file for the material
    '''
    print("Starting main function")  # Debugging print
    sys.stdout.flush()

    
   # brain_file = dir + 'BraTS-GLI-00000-000-t2f.nii.gz'
    mask_volume = np.load('../results/prediction.npy')
    padding = np.zeros((mask_volume.shape[0], mask_volume.shape[1], 11), dtype=np.uint8)
    mask_volume = np.concatenate((mask_volume, padding), axis=2)
    
    
    print("Files found, loading data...")
    sys.stdout.flush()
    
    print(t2)
    brain = nib.load(t2)
    brain_volume = brain.get_fdata()
    print(brain_volume.shape)

    print("Data loaded, processing...")
    sys.stdout.flush()

    colors = {
        0: (0.0, 0.0, 0.0),
        1: (1.0, 0.0, 0.0),
        2: (0.0, 1.0, 0.0),
        3: (0.0, 0.0, 1.0)
    }

    brain_volume = np.rot90(brain_volume, k=1, axes=(1, 2))
    mask_volume = np.rot90(mask_volume, k=1, axes=(1, 2))

    mlab.figure(size=(800, 800), bgcolor=(1, 1, 1))

    brain_masked = np.copy(brain_volume)
    brain_masked[mask_volume != 0] = 0

    value = int(value)
    print(f"value: {value}, type: {type(value)}")
    print(f"axis: {axis}, type: {type(axis)}")
    sys.stdout.flush()
    
    if axis == 'x':
        print(f"Cutting on axis {axis} at value {value}")
        src_brain = mlab.pipeline.scalar_field(brain_masked[:value,:,:].astype(np.float64))
    elif axis == 'y':
        src_brain = mlab.pipeline.scalar_field(brain_masked[:,:,:value].astype(np.float64))
    elif axis == 'z':
        src_brain = mlab.pipeline.scalar_field(brain_masked[:,:value,:].astype(np.float64))
    else:
        print(f"Invalid axis: {axis}")
        sys.stdout.flush()
        sys.exit(1)
        
    brain_surface = mlab.pipeline.iso_surface(src_brain, color=(0.6, 0.79, 0.8), opacity=0.5)
    surfaces = []

    for class_value, color in colors.items():
        if class_value == 0:
            continue
        if axis == 'x':
            mask = mask_volume[:value,:,:] == class_value
        elif axis == 'y':
            mask = mask_volume[:,:,:value] == class_value
        elif axis == 'z':
            mask = mask_volume[:,:value,:] == class_value
        src = mlab.pipeline.scalar_field(mask.astype(np.float64))
        surf = mlab.pipeline.iso_surface(src, color=color, opacity=1, contours=20)
        surfaces.append(surf)

    mlab.view(azimuth=90, elevation=90, roll=0)

    output_file = '../results/brainCutted.obj'
    mlab.savefig(output_file, figure=mlab.gcf())
    print(f"Saved file to {output_file}")
    sys.stdout.flush()

if __name__ == "__main__":
    print("Script invoked directly")  # Debugging print
    sys.stdout.flush()

    if len(sys.argv) != 4:
        print("Usage: script.py <t2> <axis> <value>")
        sys.stdout.flush()
        sys.exit(1)

    t2 = sys.argv[1]
    axis = sys.argv[2]
    value = sys.argv[3]

    print(f"Arguments received: axis={axis}, value={value}")
    sys.stdout.flush()

    main(t2, axis, value)
