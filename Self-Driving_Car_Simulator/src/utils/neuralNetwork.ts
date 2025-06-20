import { NeuralNetwork } from '../types';

export function createNeuralNetwork(layers: number[]): NeuralNetwork {
  const weights: number[][][] = [];
  const biases: number[][] = [];

  for (let i = 0; i < layers.length - 1; i++) {
    const layerWeights: number[][] = [];
    const layerBiases: number[] = [];

    for (let j = 0; j < layers[i + 1]; j++) {
      const neuronWeights: number[] = [];
      for (let k = 0; k < layers[i]; k++) {
        neuronWeights.push(Math.random() * 2 - 1); // Random between -1 and 1
      }
      layerWeights.push(neuronWeights);
      layerBiases.push(Math.random() * 2 - 1);
    }

    weights.push(layerWeights);
    biases.push(layerBiases);
  }

  return { weights, biases, layers };
}

export function feedForward(network: NeuralNetwork, inputs: number[]): number[] {
  let outputs = [...inputs];

  for (let i = 0; i < network.weights.length; i++) {
    const newOutputs: number[] = [];

    for (let j = 0; j < network.weights[i].length; j++) {
      let sum = network.biases[i][j];
      
      for (let k = 0; k < outputs.length; k++) {
        sum += outputs[k] * network.weights[i][j][k];
      }

      newOutputs.push(sigmoid(sum));
    }

    outputs = newOutputs;
  }

  return outputs;
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function mutateNetwork(network: NeuralNetwork, mutationRate: number = 0.1): NeuralNetwork {
  const newNetwork: NeuralNetwork = {
    weights: network.weights.map(layer => 
      layer.map(neuron => 
        neuron.map(weight => 
          Math.random() < mutationRate ? weight + (Math.random() * 0.4 - 0.2) : weight
        )
      )
    ),
    biases: network.biases.map(layer => 
      layer.map(bias => 
        Math.random() < mutationRate ? bias + (Math.random() * 0.4 - 0.2) : bias
      )
    ),
    layers: [...network.layers]
  };

  return newNetwork;
}

export function crossoverNetworks(parent1: NeuralNetwork, parent2: NeuralNetwork): NeuralNetwork {
  const child: NeuralNetwork = {
    weights: [],
    biases: [],
    layers: [...parent1.layers]
  };

  // Crossover weights
  for (let i = 0; i < parent1.weights.length; i++) {
    const layerWeights: number[][] = [];
    for (let j = 0; j < parent1.weights[i].length; j++) {
      const neuronWeights: number[] = [];
      for (let k = 0; k < parent1.weights[i][j].length; k++) {
        neuronWeights.push(Math.random() < 0.5 ? parent1.weights[i][j][k] : parent2.weights[i][j][k]);
      }
      layerWeights.push(neuronWeights);
    }
    child.weights.push(layerWeights);
  }

  // Crossover biases
  for (let i = 0; i < parent1.biases.length; i++) {
    const layerBiases: number[] = [];
    for (let j = 0; j < parent1.biases[i].length; j++) {
      layerBiases.push(Math.random() < 0.5 ? parent1.biases[i][j] : parent2.biases[i][j]);
    }
    child.biases.push(layerBiases);
  }

  return child;
}