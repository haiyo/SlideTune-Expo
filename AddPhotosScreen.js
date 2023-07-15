import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { PermissionsAndroid, View, Text, Button, ImageBackground, Image, StyleSheet, Modal, TextInput, FlatList, Dimensions, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import MusicBar from './MusicBar';
import RNFetchBlob from 'rn-fetch-blob';
import Checkbox from '@react-native-community/checkbox';
import { launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay';
import { faMusic } from '@fortawesome/free-solid-svg-icons/faMusic';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons/faTrashCan';

async function requestWritePermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Storage Permission',
        message: 'This app needs access to your storage to download music files.',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Write permission granted');
    } else {
      console.log('Write permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
}

const AddPhotosScreen = ({ route, navigation }) => {
    const { album, onUpdatePhotos } = route.params;
    const { width } = Dimensions.get('window');
    const [modalEditAlbumVisible, setModalEditAlbumVisible] = useState(false);
    const [modalDeleteAlbumVisible, setModalDeleteAlbumVisible] = useState(false);
    const [albumTitle, setAlbumTitle] = useState('');
    const [photos, setPhotos] = useState([]);
    const titleInputRef = useRef(null);

    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const [longPress, setLongPress] = useState(false);

    const [musicFile, setMusicFile] = useState(null);

    // Set Title
    useLayoutEffect(() => {
        navigation.setOptions({
            title: album.title,
            headerTitle: () => (
                <TouchableOpacity onPress={() => handleModalOpen('editAlbum')}>
                    <Text style={styles.headerTitle}>{ album.title }</Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation, album.title]);

    useEffect(() => {
        if (longPress) {
            const headerButton = selectedPhotos.length === 0 ? (
                <TouchableOpacity onPress={() => handleDone()}>
                    <Text style={{ fontSize: 18, marginRight: 10, color: "red" }}>Done</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity onPress={() => {
                    setSelectedPhotos([]);
                    setLongPress(false);
                }}>
                <Text style={{ fontSize: 18, marginRight: 10, color: "red" }}>Delete</Text>
                </TouchableOpacity>
            );

            navigation.setOptions({
                headerRight: () => headerButton,
            });
        }
        else {
            navigation.setOptions({
                headerRight: null,
            });
        }
    }, [longPress, selectedPhotos]);

    // Load Album Photos
    useEffect(() => {
        const loadPhotos = async () => {
            const existingPhotos = JSON.parse(await AsyncStorage.getItem(album.id)) || [];

            setPhotos(existingPhotos);

            existingPhotos.forEach(async (photo) => {
                console.log("First set: " + photo.id)
            });
        };
        loadPhotos();
    }, [album.id]);

    const pickFile = async () => {
        try {
            const result = await DocumentPicker.pick({
                type: [DocumentPicker.types.allFiles],
            });
            setFile(result);
        }
        catch (error) {
            console.log('Error picking file:', error);
        }
    };

    const handleDone = () => {
        setLongPress(false);
    }

    const handleAddMusic = () => {
        requestWritePermission();
      // Launch file picker to select music file
      DocumentPicker.pickSingle({
        type: [DocumentPicker.types.audio],
      })
      .then((res) => {
        // Get the local file path of the content URI
        RNFetchBlob.fs
          .stat(res.uri)
          .then(stats => {
            const filePath = stats.path;
            const fileURI = Platform.OS === 'android' ? 'file://' + filePath : filePath;
            // Use the file URI to play the audio file
            // Add music to selected album
            const updatedAlbum = {
              ...album,
              music: [
                ...album.music,
                {
                  id:`${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  name: res.name,
                  type: res.type,
                  uri: fileURI,
                }
              ]
            };
            console.log(updatedAlbum.music[0].name)
            //setAlbum(updatedAlbum);
            setMusicFile(updatedAlbum.music[0]);
          })
          .catch(error => {
            console.log(error);
          });
      })
      .catch((err) => {
        if (DocumentPicker.isCancel(err)) {
          // User cancelled the picker
        } else {
          console.log(err);
        }
      });
    }

    const handleEditAlbum = async () => {
        album.title = albumTitle;
        setModalEditAlbumVisible(false);

        // Retrieve existing albums data from storage
        const albumsData = await AsyncStorage.getItem('albums');
        const albums = JSON.parse(albumsData);

        // Find the album to update and update its title property
        const albumIndex = albums.findIndex(a => a.id === album.id);
        albums[albumIndex].title = albumTitle;

        // Store the updated array of albums back into storage
        await AsyncStorage.setItem('albums', JSON.stringify(albums));

        onUpdatePhotos(album.id, photos);
    };

    const handleDeleteAlbum = async () => {
        setModalDeleteAlbumVisible(false);

        // Retrieve existing albums data from storage
        const albumsData = await AsyncStorage.getItem('albums');
        const albums = JSON.parse(albumsData);

        // Find the album to delete and remove it from the array
        const albumIndex = albums.findIndex(a => a.id === album.id);
        albums.splice(albumIndex, 1);

        // Remove the album data from storage
        await AsyncStorage.removeItem(album.id);
        await AsyncStorage.setItem('albums', JSON.stringify(albums));

        // Call the onUpdatePhotos function to update the album list in state
        onUpdatePhotos(null);
        navigation.goBack();
    };

    const handleLongPress = (photo) => {
        setLongPress(true);
        setSelectedPhotos([photo]);
    };

    const handleCheckboxChange = (photo) => {
        setSelectedPhotos((prev) => {
            if (prev.includes(photo)) {
                return prev.filter((p) => p !== photo);
            }
            else {
                return [...prev, photo];
            }
        });
    };

    const handlePhotoTap = (photo) => {
        if(longPress) {
            handleCheckboxChange(photo);
        }
    };

    const handleSelectPhotos = async () => {
        const existingAssetIds = photos.map((photo) => photo.uri);

        const options = {
            mediaType: 'photo',
            maxHeight: 800,
            maxWidth: 800,
            quality: 0.8,
            selectionLimit: 0,
            includeBase64: false,
            selectedAssets: existingAssetIds,
        };

        launchImageLibrary(options, async (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            }
            else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            }
            else {
                const existingIds = photos.map((photo) => photo.id);
                const newPhotos = response.assets.filter((photo) => !existingIds.includes(photo.id));

                // add id property to each photo object
                const updatedPhotos = newPhotos.map((photo) => ({
                    ...photo,
                    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                }));

                /*const existingPhotos = album.photos.filter((photo) => {
                    const photoInResponse = response.assets.find(
                        (responsePhoto) => responsePhoto.uri === photo.uri
                    );
                    return !!photoInResponse;
                });

                if (newPhotos.length === 0) {
                    console.log('All selected photos are already in the album');
                    return;
                }*/

                const allPhotos = [...photos, ...updatedPhotos];

                setPhotos(allPhotos);

                /*const updatedAlbum = {
                    ...album,
                    photos: allPhotos,
                };*/

                await AsyncStorage.setItem(album.id, JSON.stringify(allPhotos));

                // Call the onUpdatePhotos function to update the album photos in state
                onUpdatePhotos(album.id, allPhotos);
            }
        });
    };

    const handleModalOpen = (type) => {
        if(type == 'editAlbum') {
            console.log("ddfdf")
            setModalEditAlbumVisible(true);
        }
        else if(type == 'deleteAlbum') {
            setModalDeleteAlbumVisible(true);
        }
    };

    useEffect(() => {
        if (titleInputRef.current) {
            titleInputRef.current.focus();
        }
    }, [modalEditAlbumVisible]);

    const renderPhoto = ({ item: photo }) => {
        const backgroundImage = {uri: photo.uri};

        return (
            <TouchableWithoutFeedback style={styles.photoContainer}
                                    key={photo.id}
                                    onPress={() => handlePhotoTap(photo)}
                                    onLongPress={() => handleLongPress(photo)}>
                <View style={styles.photoContainer}>
                    <Image
                        source={backgroundImage}
                        style={styles.photo}
                        borderRadius={10}
                    />
                    {longPress && (
                        <View style={styles.checkboxContainer}>
                            <Checkbox
                                value={selectedPhotos.includes(photo)}
                                onValueChange={() => handleCheckboxChange(photo)}
                            />
                        </View>
                    )}
                </View>
            </TouchableWithoutFeedback>
        );
    };

    return (
        <View style={styles.container}>
            {/*<MusicBar music={musicFile} />*/}
            <Modal animationType="slide"
                transparent={true}
                visible={modalEditAlbumVisible}
                onRequestClose={() => {
                    setModalEditAlbumVisible(false);
                }}>

                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Change Album Title</Text>

                        <TextInput style={styles.textInput}
                                placeholder="Album Title"
                                value={albumTitle}
                                onChangeText={setAlbumTitle}
                                ref={titleInputRef} />

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => setModalEditAlbumVisible(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <Button title="Save" onPress={handleEditAlbum} />
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal animationType="slide"
                transparent={true}
                visible={modalDeleteAlbumVisible}
                onRequestClose={() => {
                    setModalDeleteAlbumVisible(false);
                }}>

                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Delete Album</Text>
                        <Text style={styles.modalText}>You cannot undo this action. Do you want to proceed anyway?</Text>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => setModalDeleteAlbumVisible(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <Button title="Delete" onPress={handleDeleteAlbum} />
                        </View>
                    </View>
                </View>
            </Modal>

            <FlatList
                data={photos}
                renderItem={renderPhoto}
                keyExtractor={(photo) => photo.id}
                numColumns={2}
                contentContainerStyle={styles.photoList}
            />

            <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.addButton} onPress={() => handleModalOpen('deleteAlbum')}>
                    <FontAwesomeIcon icon={ faTrashCan } style={ styles.plusIcon } size={ 32 }  />
                </TouchableOpacity>

                <TouchableOpacity style={styles.addButton} onPress={handleSelectPhotos}>
                    <FontAwesomeIcon icon={ faPlus } style={ styles.plusIcon } size={ 32 }  />
                </TouchableOpacity>

                <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('SlideShowScreen', { albumId: album.id })}>
                    <FontAwesomeIcon icon={ faPlay } style={ styles.plusIcon } size={ 32 }  />
                </TouchableOpacity>

                <TouchableOpacity style={styles.addButton} onPress={() => handleAddMusic()}>
                    <FontAwesomeIcon icon={ faMusic } style={ styles.plusIcon } size={ 32 }  />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000'
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        width: '90%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalText: {
        fontSize: 18,
        marginBottom: 10,
    },
    textInput: {
        marginVertical: 10,
        padding: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        width: '100%',
    },
    cancelText: {
        fontSize: 16,
        color: '#007AFF',
        alignSelf: 'flex-start'
    },
    buttonContainer: {
        flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 20,
          width: '100%'
    },
    container: {
        flex: 1
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10
    },
    button: {
        backgroundColor: '#4fc3f7',
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginHorizontal: 10,
    },
    photoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 5,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        height: 150,
        width: '100%',
    },
    photoList: {
        paddingHorizontal: 5,
        paddingVertical: 5,
    },
    photo: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover'
    },
    checkboxContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 4,
    },
    addButton: {
        backgroundColor: '#4fc3f7',
        borderRadius: 50,
        height: 60,
        width: 60,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10,
        zIndex: 2,
    },
    plusIcon: {
        color: '#fff'
    },
    photoBackground: {
        flex: 1,
        resizeMode: 'cover',
        ...StyleSheet.absoluteFill,
        borderRadius: 10,
        overflow: 'hidden'
    },
});

export default AddPhotosScreen;