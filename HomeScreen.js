import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { View, ImageBackground , Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import AddPhotosScreen from './AddPhotosScreen';
import AddAlbumPlaceholder from './AddAlbumPlaceholder';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';

const HomeScreen = () => {
    const [albumTitle, setAlbumTitle] = useState('');
    const [albums, setAlbums] = useState([]);
    const titleInputRef = useRef(null);
    const navigation = useNavigation();

    const handleClearStorage = async () => {
      try {
        await AsyncStorage.clear();
        console.log('Storage cleared successfully.');
      } catch (error) {
        console.log('Error clearing storage:', error);
      }
    }

    const handleCreateAlbum = async () => {
        // Create a new album object with the title and an empty array of photos
        const newAlbum = {
            id: Date.now().toString(),
            title: "Album " + albums.length,
            photos: [],
            music: []
        };

        // Add the new album to the existing albums array
        albums.push(newAlbum);

        // We don't want to save placeholder
        const parsedAlbums = albums.filter(a => a.id !== 'placeholder');

        // Save the updated albums array to AsyncStorage
        await AsyncStorage.setItem('albums', JSON.stringify(parsedAlbums));

        // Navigate to the AddPhotosScreen
        navigation.navigate('AddPhotosScreen', {
            album: newAlbum,
            onUpdatePhotos: handleUpdatePhotos
        });

        handleUpdatePhotos(newAlbum.id, []);
    };

    const handleUpdatePhotos = async (albumId, photos) => {
        if(albumId == null) {
            // An album has been deleted. Refresh list.
            setAlbums([]);
        }
        else {
            const updatedAlbums = albums.map((album) => {
                if (album.id === albumId) {
                    return { ...album, photos: photos };
                }
                return album;
            });
            setAlbums(updatedAlbums);
        }
    };

    useEffect(() => {
        const getAlbums = async () => {
            const albums = await AsyncStorage.getItem('albums');
            let updatedAlbums = [];

            if (albums) {
                const parsedAlbums = JSON.parse(albums);

                // Loop through the albums and retrieve the photos from AsyncStorage
                updatedAlbums = await Promise.all(parsedAlbums.map(async album => {
                    const photos = await AsyncStorage.getItem(album.id);

                    if (photos) {
                        album.photos = JSON.parse(photos);
                    }
                    return album;
                }));
            }

            setAlbums([{ id: 'placeholder' }, ...updatedAlbums]);
        };
        getAlbums();
    }, [albums]);

    const renderAlbum = ({ item }) => {
        if (item.id === 'placeholder') {
            return <AddAlbumPlaceholder onPress={handleCreateAlbum} />;
        }

        const backgroundImage = item.photos.length > 0 ? {uri: item.photos[0].uri} : null;

        if (backgroundImage === null) {
            return (
                <TouchableOpacity style={styles.albumContainer} onPress={() => navigation.navigate('AddPhotosScreen', { album: item, onUpdatePhotos: handleUpdatePhotos })}>
                    <View style={styles.albumNoBackground}>
                        <Text style={styles.albumTitle}>{item.title}</Text>
                    </View>
                </TouchableOpacity>
            );
        }
        else {
            return (
                <TouchableOpacity style={styles.albumContainer} onPress={() => navigation.navigate('AddPhotosScreen', { album: item, onUpdatePhotos: handleUpdatePhotos })}>
                    {backgroundImage && (
                        <ImageBackground source={backgroundImage} style={styles.albumBackground}>
                            <View style={styles.albumTitleContainer}>
                                <Text style={styles.albumTitle}>{item.title}</Text>
                            </View>
                        </ImageBackground>
                    )}
                    {!backgroundImage && (
                        <View style={styles.albumNoBackground}>
                            <Text style={styles.albumTitle}>{item.title}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            );
        }
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={albums}
                renderItem={renderAlbum}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.albumList}
            />
        </View>
      );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    albumContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 5,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 5,
        height: 150,
        width: '100%',
    },
    albumItem: {
        backgroundColor: '#fff',
        borderRadius: 10,
        width: '100%',
        alignItems: 'center'
    },
    albumTitleContainer: {
      flex: 1,
      justifyContent: 'flex-end'
    },
    albumTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#fff',
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
        padding: 5,
        paddingLeft: 10,
        alignItems: 'center',
        backgroundColor: 'rgba(153, 153, 153, 0.5)',
    },
    albumList: {
        paddingVertical: 5,
        alignItems: "stretch"
    },
    albumBackground: {
        flex: 1,
        resizeMode: 'cover',
        ...StyleSheet.absoluteFill,
        borderRadius: 10,
        overflow: 'hidden'
    },
});

export default HomeScreen;
