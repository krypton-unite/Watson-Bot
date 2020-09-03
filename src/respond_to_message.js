import { process_message } from '../src/watson.js';
import {translation} from './translation.js';
import format from './utils/format.js';
import moment from 'moment';
const zodiac = require('zodiac-signs')(translation.language);

const respond_to_message = async (assistant, session_id, message, robot_data) => {
    const result = await process_message(assistant, session_id, message.content);
    console.log(JSON.stringify(result, null, 2));
    let generic_output
    for (generic_output of result.output.generic) {
        message.channel.send(generic_output.text);
    }
    let intent
    for (intent of result.output.intents) {
        if (intent.intent == "What-is-your-age") {
            message.channel.send(robot_data.birthday == undefined ? translation.undefined_birthday :
                format(translation.age_response, moment.duration(moment().diff(robot_data.birthday)).humanize()))
        }
        if (intent.intent == "What-is-your-birthday") {
            message.channel.send(robot_data.birthday == undefined ? translation.undefined_birthday :
                format(translation.birthday_response, robot_data.birthday.format("lll")))
        }
        if (intent.intent == "Which-is-your-zodiac_sign") {
            message.channel.send(robot_data.birthday == undefined ? translation.undefined_birthday :
                format(translation.zodiac_sign_response, zodiac.getSignByDate({ day: robot_data.birthday.date(), month: robot_data.birthday.month() }).name))
        }
        if (intent.intent == "Who-is-your-creator") {
            message.channel.send(robot_data.creator == undefined ? translation.undefined_creator :
                format(translation.creator_response, robot_data.creator));
        }
    }
}

export default respond_to_message;
