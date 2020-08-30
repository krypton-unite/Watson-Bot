import { instantiate_assistant, instantiate_session, process_message } from '../src/watson.js';
import { expect } from 'chai';

describe('Should correctly identify offences\' traits in:', async () => {
    let assistant;
    let session_id;
    before(async () => {
        assistant = instantiate_assistant();
        session_id = await instantiate_session(assistant);
    });
    describe('- Portuguese:', async () => {
        it('\'Você vai para o céu!\'', async () => {
            const result = await process_message(assistant, session_id, 'Você é o cara!');
            expect(result.output.intents[0].intent).to.be.equal('General_Positive_Feedback');
        });
        it('\'Seu imbecil!\'', async () => {
            const result = await process_message(assistant, session_id, 'Você me deixa nervoso!');
            expect(result.output.intents[0].intent).to.be.equal('General_Negative_Feedback');
        });
    });
    describe('- English:', async () => {
        it('\'You will go to hell!\'', async () => {
            const result = await process_message(assistant, session_id, 'You will go to hell!');
            expect(result.output.intents).to.eql([]);
        });
        it('\'You dumb!\'', async () => {
            const result = await process_message(assistant, session_id, 'You dumb!');
            expect(result.output.intents).to.eql([]);
        });
    });
});