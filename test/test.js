import analyzeText from '../src/watson.js';
import chai from 'chai';
const should = chai.should();

describe('Should correctly identify offences\' traits in:', async () => {
    describe('- Portuguese:', async () => {
        it('\'Você vai para o inferno!\'', async () => {
            const result = await analyzeText('Você vai para o inferno!');
            assert(true);
        });
        it('\'Seu imbecil!\'', async () => {
            const result = await analyzeText('Seu imbecil!');
            assert(true);
        });
    });
    describe('- English:', async () => {
        it('\'You will go to hell!\'', async () => {
            const result = await analyzeText('You will go to hell!');
            assert(true);
        });
        it('\'You dumb!\'', async () => {
            const result = await analyzeText('You dumb!');
            assert(true);
        });
    });
});