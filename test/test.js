import analyzeText from '../src/watson.js';
import chai, { expect } from 'chai';
import {default as resultA1} from './expected_results/resultA1.json';
import {default as resultA2} from './expected_results/resultA2.json';
import {default as resultB1} from './expected_results/resultB1.json';
import {default as resultB2} from './expected_results/resultB2.json';
import {default as resultC1} from './expected_results/resultC1.json';
import {default as resultC2} from './expected_results/resultC2.json';
import {default as resultD1} from './expected_results/resultD1.json';
import {default as resultD2} from './expected_results/resultD2.json';
const should = chai.should();

describe('Should correctly identify offences\' traits in:', async () => {
    describe('- Portuguese:', async () => {
        it('\'Você vai para o inferno!\'', async () => {
            const result = await analyzeText('Você vai para o inferno!');
            expect(result).to.not.equal(resultA1).and.to.not.equal(resultA2);
        });
        it('\'Seu imbecil!\'', async () => {
            const result = await analyzeText('Seu imbecil!');
            expect(result).to.not.equal(resultB1).and.to.not.equal(resultB2);
        });
    });
    describe('- English:', async () => {
        it('\'You will go to hell!\'', async () => {
            const result = await analyzeText('You will go to hell!');
            expect(result).to.not.equal(resultC1).and.to.not.equal(resultC2);
        });
        it('\'You dumb!\'', async () => {
            const result = await analyzeText('You dumb!');
            // console.log(JSON.stringify(result, null, 2));
            expect(result).to.not.equal(resultD1).and.to.not.equal(resultD2);
        });
    });
});