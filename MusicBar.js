import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlay, faPause, faStop } from '@fortawesome/free-solid-svg-icons';
import RNFS from 'react-native-fs';
import Sound from 'react-native-sound';

const MusicBar = ({ music }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [sound, setSound] = useState(null);

    const handlePlayPause = () => {
        if (sound && sound.isPlaying()) {
            setIsPlaying(false);
            //sound.pause();
            sound.stop();
        }
        else {
            setIsPlaying(true);
            playMusic();
        }
    };

    const saveToRawFolder = async (musicFileUri, fileName) => {
        try {
            // Create the raw folder if it doesn't exist
            const rawFolderPath = `${RNFS.DocumentDirectoryPath}/raw`;
            const isRawFolderExists = await RNFS.exists(rawFolderPath);

            if (!isRawFolderExists) {
                await RNFS.mkdir(rawFolderPath);
            }

            // Save the file to the raw folder
            const filePath = `${rawFolderPath}/${fileName}`;
            await RNFS.copyFile(musicFileUri, filePath);

            console.log(`File saved to ${filePath}`);

            return filePath; // Return the file path
        }
        catch (error) {
            console.error('Failed to save file:', error);
            throw error; // Throw the error to handle it later
        }
    };

    const playMusic = () => {
        if (sound) {
            sound.setCurrentTime(0); // reset the playback position to 0
            sound.play();
            setIsPlaying(true);
        }
        else {
            const musicName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` + ".mp3";

            saveToRawFolder(music.uri, musicName).then((rawPath) => {
                console.log(`File saved to ${rawPath}`);

                // Import the react-native-sound module
                var Sound = require('react-native-sound');

                // Enable playback in silence mode
                Sound.setCategory('Playback');

                // Load the sound file 'whoosh.mp3' from the app bundle
                // See notes below about preloading sounds within initialization code below.
                console.log(`Loading sound file from ${rawPath}...`);

                var whoosh = new Sound(`${rawPath}`, Sound.MAIN_BUNDLE, (error) => {
                    if (error) {
                        console.log('failed to load the sound', error);
                        return;
                    }

                    // loaded successfully
                    console.log('duration in seconds: ' + whoosh.getDuration() + 'number of channels: ' +
                                    whoosh.getNumberOfChannels());

                    // Save the reference to the sound object
                    setSound(whoosh);
                    setIsPlaying(true);

                    // Play the sound with an onEnd callback
                    whoosh.play((success) => {
                        if (success) {
                            console.log('successfully finished playing');
                            setIsPlaying(false);
                        }
                        else {
                            console.log('playback failed due to audio decoding errors');
                            setIsPlaying(false);
                        }
                    });
                });

            }).catch((error) => {
                console.log(`Failed to save file: ${error}`);
            });
        }
    };


    return (
        <View style={styles.container}>
            <Text style={styles.title}>{music ? music.name : ''}</Text>

            <TouchableOpacity style={styles.button} onPress={handlePlayPause}>
                <FontAwesomeIcon
                    icon={isPlaying ? faStop : faPlay}
                    style={styles.plusIcon}
                    size={15}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = {
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ccc',
        height: 50,
        paddingHorizontal: 10,
        borderBottomColor: '#ddd',
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    button: {
        backgroundColor: 'grey',
        borderRadius: 20,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    plusIcon: {
        color: '#fff'
    }
};

export default MusicBar;