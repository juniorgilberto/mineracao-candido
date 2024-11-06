import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text, Touchable, View
} from 'react-native';
import { Container } from './styles';
import { TouchableOpacity } from 'react-native';

export default function Clientes() {
    return (
    <Container>
      <View style={styles.ViewInicial}>
          <Text style={ styles.TextBody }>
              {`Tela Clientes!`}
          </Text>
      </View>
    </Container>
    )
}

const styles = StyleSheet.create({
    ViewInicial: {
      margin: 10
    },
    TextBody: {
      color: "#fff",
      fontSize: 23,
      marginBottom: 5,
      textAlign: "center"
    },
    BotaoPadraoTexto: {
      color: "#fff",
      fontSize: 14
    },
    BotaoLink: {
      alignItems: 'center',
      padding: 15,
      margin: 5,
    },
});