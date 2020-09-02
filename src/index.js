/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import mongo_client from './mongo_driver';
import { instantiate_assistant, instantiate_session, process_message } from '../src/watson.js';
import dotenv from 'dotenv';
import Discord from 'discord.js';
import format from './utils/format.js';
import {default as translation} from '../assets/translation.pt.json';
import moment from 'moment';
import 'moment/locale/pt-br';
moment.locale(translation.language);
dotenv.config();

if (process.env.NODE_ENV !== 'production') {
  console.log(translation.dev_mode);
}

const assistant = instantiate_assistant();

mongo_client.connect_mongo_client(async (err, db_client) => {

  if (err) throw err;

  const watson_bot_db = db_client.db("watson_bot_db");
  // let offence_records = watson_bot_db.collection('offence_records');
  let robot_memory = watson_bot_db.collection('robot_memory');

  // Create an instance of a Discord client
  const client = new Discord.Client();

  let session_id;

  let session_callback;
  client.on('channelCreate', async (dmChannel) => {
    console.log(format('Channel {0} created with user {1}!', dmChannel.id, dmChannel.recipient.username));
    session_id = await instantiate_session(assistant);
    console.log(format("Just created session id is {0}", session_id))
    if (session_callback){
      await session_callback(session_id);
    }
  })

  client.on('channelDelete', (dmChannel)=> {
    console.log(format('Channel {0} with user {1} deleted!', dmChannel.id, dmChannel.recipient.username));
  })

  client.on('ready', () => {
    console.log(translation.ready);
  });

  let robot_creator_record = await robot_memory.findOne({ _id: 'my_creator' });
  let robot_creator;
  if (robot_creator_record != null){
    robot_creator = robot_creator_record['creator_id'];
  }

  let robot_birthday_record = await robot_memory.findOne({ _id: 'my_birthday' });
  let robot_birthday;
  if (robot_birthday_record != null){
    robot_birthday = moment(robot_birthday_record['timestamp']);
  }  

  const process_this = async (session_id, message) => {
    const result = await process_message(assistant, session_id, message.content);
    console.log(JSON.stringify(result, null, 2));
    let generic_output
    for (generic_output of result.output.generic){
      message.channel.send(generic_output.text);
    }
    console.log(JSON.stringify(result.output.intents, null, 2))
    let intent
    for (intent of result.output.intents){
      if (intent.intent == "What-is-your-age"){
        if (robot_birthday == undefined){
          message.channel.send(translation.undefined_birthday);
        }else{
          message.channel.send(format("Minha idade é {0}", moment.duration(moment().diff(robot_birthday)).humanize()));
        }
      }
      if (intent.intent == "What-is-your-birthday"){
        if (robot_birthday == undefined){
          message.channel.send(translation.undefined_birthday);
        }else{
          message.channel.send(format("Minha data de nascimento é {0}", robot_birthday.format("lll")));
        }
      }
    }
  }

  client.on('message', async (message) => {
    // Ignore messages that aren't from a guild
    // if (!message.guild) return;
    if (message.author.bot) return;

    // Evaluate attributes of user's message
    console.log(format('Received a message: {0}', message.content))
    // console.log(format("Session id is {0}", session_id))
    
    if (!session_id){
      session_callback = async (session_id) => {
        await process_this(session_id, message)
      }
    }else{
      await process_this(session_id, message);
    }

    // if (message.content.startsWith('!carma')) {
    //   const karma = await getKarma(message.author.id);
    //   const explanation = translation.explanation;
    //   message.channel.send(karma ? format(translation.your_offences, message.author.id) + karma + '\n\n' + explanation : translation.no_karma_yet);
    // }

    if (message.content.startsWith(translation.adopt_me)) {
      if (robot_creator == null){
        robot_creator = message.author.id
        await robot_memory.insertOne({ _id: 'my_creator', creator_id: robot_creator })
        message.channel.send(format(translation.just_adopted, robot_creator));
      }else{
        message.channel.send(
          format((robot_creator == message.author.id)? translation.already_adopted : translation.my_creator_is,
          robot_creator)
        );
      }
    }

    if (message.author.id == robot_creator){
      if (message.content.startsWith(translation.set_birthday)) {
        const date = new Date();
        await robot_memory.insertOne({ _id: 'my_birthday', timestamp: + date })
      }
    }
    // const forgive_command = translation.forgive_me;
    // if (message.author.id == robot_creator){
    //   if (message.content.startsWith(forgive_command)) {
    //     const karma = await getKarma(message.author.id);
    //     if (!karma){
    //       message.channel.send(translation.no_need_to_forgive);
    //       return;
    //     }
    //     message.channel.send(translation.forgiven_creator_offences);
    //   }
    //   const preamble_frag3 = " <@!";
    //   const preamble_source = translation.preamble_frag1+translation.preamble_frag2+preamble_frag3;
    //   const preamble = new RegExp(preamble_source)
    //   const postamble_source = ">";
    //   const re = new RegExp(preamble.source + /.*/.source + postamble_source);
    //   if (re.test(message.content)) {
    //     const user_to_forgive = message.content.match(new RegExp("(?<="+preamble_source+")(.*)(?="+postamble_source+")"))[0]
    //     const gender_letter = message.content.match("(?<="+translation.preamble_frag1+")"+translation.preamble_frag2+"(?="+preamble_frag3+"((.*)(?="+postamble_source+")))")[0]
    //     message.channel.send(format(translation.forgiven_offences, gender_letter, user_to_forgive));
    //   }
    // }else{
    //   if (message.content.startsWith(forgive_command)) {
    //     message.channel.send(translation.future_forgiveness);
    //   }
    // }
  });

  // Log our bot in using the token from https://discordapp.com/developers/applications/me
  client.login(process.env.DISCORD_TOKEN);
})