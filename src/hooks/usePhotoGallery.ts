import { useState, useEffect } from "react";
import { useCamera } from '@ionic/react-hooks/camera';
import { useFilesystem, base64FromPath } from '@ionic/react-hooks/filesystem';
import { useStorage } from '@ionic/react-hooks/storage';
import { isPlatform } from '@ionic/react';
import { CameraResultType, CameraSource, CameraPhoto, Capacitor, FilesystemDirectory } from "@capacitor/core";
import { save } from "ionicons/icons";


export interface Photo {
  filepath: string;
  webviewPath?: string;
  base64?: string;
}

export function usePhotoGallery() {

  const { deleteFile, getUri, readFile, writeFile } = useFilesystem();

  const { getPhoto } = useCamera();

  const [photos, setPhotos] = useState<Photo[]>([]);

  const takePhoto = async () => {
    const cameraPhoto = await getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

    const fileName = new Date().getTime() + '.jpg';
    const saveFileImage = await savePicture(cameraPhoto, fileName);
    const newPhotos = [saveFileImage, ...photos];
    setPhotos(newPhotos)
  };

  const savePicture = async (photo: CameraPhoto, fileName: string) => {
    const base64Data = await base64FromPath(photo.webPath!);
    await writeFile({
      path: fileName,
      data: base64Data,
      directory: FilesystemDirectory.Data
    });
    return getPhotoFile(photo, fileName);
  };

  const getPhotoFile = async (cameraPhoto: CameraPhoto, fileName: string) => {
    return {
      filepath: fileName,
      webviewPath: cameraPhoto.webPath
    };
  };

  return {
    photos,
    takePhoto
  };
}