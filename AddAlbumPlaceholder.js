import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const AddAlbumPlaceholder = ({ onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.container}>
            <View style={styles.placeholder}>
                <FontAwesomeIcon icon={faPlus} style={styles.plusIcon} size={32} />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 5,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 5,
        height: 150,
        width: '100%',
        borderStyle: 'dotted',
        borderWidth: 2,
        borderColor: '#ccc',
        opacity: .8
    },
    placeholder: {
        width: 100,
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    plusIcon: {
        color: '#888',
    },
});

export default AddAlbumPlaceholder;