import { instantiate_assistant, instantiate_session, get_session_details, raw_delete_session, delete_session, process_message } from '../src/watson.js';
import { expect } from 'chai';

let assistant;
before(async () => {
    assistant = instantiate_assistant();
});

let session_id;
describe('Session:', async () => {
    it('- create', async () => {
        const res = await instantiate_session(assistant);
        expect(res.status).to.be.equal(201);
        session_id = res.result.session_id;
    });
    it('- delete', async () => {
        const res = await raw_delete_session(assistant, session_id);
        expect(res.status).to.be.equal(200);
    });
});

describe('Should pass all the following tests:', async () => {
    before(async () => {
        session_id = (await get_session_details(assistant)).id;
    });
    describe('- Portuguese:', async () => {
        it('Você vai para o céu!', async () => {
            const result = await process_message(assistant, session_id, 'Você é o cara!');
            expect(result.output.intents[0].intent).to.be.equal('General_Positive_Feedback');
        });
        it('Seu imbecil!', async () => {
            const result = await process_message(assistant, session_id, 'Você me deixa nervoso!');
            expect(result.output.intents[0].intent).to.be.equal('General_Negative_Feedback');
        });
    });
    describe('- English:', async () => {
        it('You will go to hell!', async () => {
            const result = await process_message(assistant, session_id, 'You will go to hell!');
            expect(result.output.intents).to.eql([]);
        });
        it('You dumb!', async () => {
            const result = await process_message(assistant, session_id, 'You dumb!');
            expect(result.output.intents).to.eql([]);
        });
    });
});