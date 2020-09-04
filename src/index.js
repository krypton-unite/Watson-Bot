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
import { instantiate_assistant, get_session_details, delete_session } from '../src/watson.js';
import respond_to_message from './respond_to_message.js';
import dotenv from 'dotenv';
import Discord from 'discord.js';
import format from './utils/format.js';
import interval from 'interval-promise';
import { translation } from './translation.js';
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
  let robot_memory = watson_bot_db.collection('robot_memory');

  // Create an instance of a Discord client
  const client = new Discord.Client();

  let session_details;

  // let session_callback;
  client.on('channelCreate', async (dmChannel) => {
    console.log(format(translation.just_created_channel, dmChannel.id, dmChannel.recipient.username));
  })

  const delete_session_wrapper = async () => {
    await delete_session(assistant, session_details.id);
    session_details = undefined;
  };

  client.on('channelDelete', async (dmChannel) => {
    if (session_details) {
      await delete_session_wrapper();
    }
    console.log(format('Channel {0} with user {1} deleted!', dmChannel.id, dmChannel.recipient.username));
  })

  client.on('ready', () => {
    console.log(translation.ready);
  });

  let robot_creator_record = await robot_memory.findOne({ _id: 'my_creator' });
  let robot_creator;
  if (robot_creator_record != null) {
    robot_creator = robot_creator_record['creator_id'];
  }

  let robot_birthday_record = await robot_memory.findOne({ _id: 'my_birthday' });
  let robot_birthday;
  if (robot_birthday_record != null) {
    robot_birthday = moment(robot_birthday_record['timestamp']);
  }

  client.on('message', async (message) => {
    // Ignore messages that aren't from a guild
    // if (!message.guild) return;
    if (message.author.bot) return;

    // Evaluate attributes of user's message
    console.log(format(translation.received_message, message.content))

    if (!session_details) {
      session_details = await get_session_details(assistant);
      const scheduled_function = async () => {
        const id_to_delete = session_details.id;
        await delete_session_wrapper();
        console.log(format(translation.just_deleted_session, id_to_delete))
      };
      interval(scheduled_function, moment.duration({ minutes: 4, seconds: 50 }).asMilliseconds(), { iterations: 1 });
      console.log(format(translation.just_created_session, session_details.id))
    } else {
      session_details.timestamp = moment();
    }
    await respond_to_message(assistant, session_details.id, message, { birthday: robot_birthday, creator: robot_creator })

    // if (message.content.startsWith('!carma')) {
    //   const karma = await getKarma(message.author.id);
    //   const explanation = translation.explanation;
    //   message.channel.send(karma ? format(translation.your_offences, message.author.id) + karma + '\n\n' + explanation : translation.no_karma_yet);
    // }

    if (message.content.startsWith(translation.adopt_me)) {
      if (robot_creator == null) {
        robot_creator = message.author.id
        await robot_memory.insertOne({ _id: 'my_creator', creator_id: robot_creator })
        message.channel.send(format(translation.just_adopted, robot_creator));
      } else {
        message.channel.send(
          format((robot_creator == message.author.id) ? translation.already_adopted : translation.my_creator_is,
            robot_creator)
        );
      }
    }

    if (message.author.id == robot_creator) {
      if (message.content.startsWith(translation.set_birthday)) {
        const date = new Date();
        await robot_memory.insertOne({ _id: 'my_birthday', timestamp: + date })
      }
    }
  });

  // Log our bot in using the token from https://discordapp.com/developers/applications/me
  client.login(process.env.DISCORD_TOKEN);
})