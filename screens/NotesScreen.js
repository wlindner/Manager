import { LayoutAnimation } from 'react-native';
import React, { Component } from 'react';
import styled from 'styled-components/native';
import uuid from 'uuid';

import NoteInput from '../components/NoteInput';
import NoteList from '../components/NoteList';

export default class NotesScreen extends Component {
  state = {
    selectedNote: null,
    expandedInput: false
  };

  saveNote = text => {
    const { report } = this.props;
    const { realm } = this.props.screenProps;
    const { selectedNote } = this.state;

    if (selectedNote) {
      //update
      realm.write(() => {
        selectedNote.text = text;
      });
      this.setState({ selectedNote: null });
    } else {
      //create
      try {
        realm.write(() => {
          const newNote = realm.create('Note', {
            key: uuid.v1(),
            text,
            report,
            createdAt: new Date()
          });
          LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
          this.forceUpdate();
        });
      } catch (e) {
        console.log('Error on creation', e);
      }
    }
  };

  deleteNote = key => {
    const { realm } = this.props.screenProps;

    try {
      realm.write(() => {
        realm.delete(realm.objectForPrimaryKey('Note', key));
        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
        this.forceUpdate();
      });
    } catch (e) {
      console.log('Error on creation', e);
    }
  };

  editNote = key => {
    const { realm } = this.props.screenProps;
    const selectedNote = realm.objectForPrimaryKey('Note', key);

    this.setState({ expandedInput: true, selectedNote });
  };

  expandInput = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    this.setState({ expandedInput: true });
  };

  retractInput = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    this.setState({ expandedInput: false, selectedNote: null });
  };

  render() {
    const { report, keyboardVerticalOffset } = this.props;
    const { realm } = this.props.screenProps;
    const { expandedInput, selectedNote } = this.state;

    const notes = realm
      .objects('Note')
      .filtered('report == $0', report)
      .sorted('createdAt', true);

    return (
      <Container
        behavior="padding"
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        <NoteInput
          note={selectedNote}
          focus={expandedInput}
          saveHandler={this.saveNote}
          onFocusHandler={this.expandInput}
          loseFocusHandler={this.retractInput}
        />
        {!expandedInput && (
          <NoteListWrapper>
            <NoteList
              notes={notes}
              editHandler={this.editNote}
              deleteHandler={this.deleteNote}
            />
          </NoteListWrapper>
        )}
      </Container>
    );
  }
}

const Container = styled.KeyboardAvoidingView`
  flex: 1;
`;

const NoteListWrapper = styled.View`
  flex: 5;
`;
