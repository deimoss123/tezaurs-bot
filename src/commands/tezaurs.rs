use regex::Regex;
use reqwest;
use scraper::{Html, Selector};
use serenity::{
    builder::CreateApplicationCommand,
    model::prelude::{
        command::CommandOptionType,
        interaction::{
            application_command::{ApplicationCommandInteraction, CommandDataOptionValue},
            InteractionResponseType,
        },
    },
    prelude::Context,
};

// -> (link, formatted return string)
fn find_word(html_string: &str, search_query: &str) -> Option<(String, String)> {
    // (css class, formatted return string)
    let search_result_types: Vec<(&str, &str)> = vec![
        ("#exactMatch", "Vārds <> atrasts tiešā formā"),
        ("#lemmas", "Atrasta vārda <> pamatforma"),
        ("#fuzzy", "Atrasta aptuvena līdzība vārdam <>"),
        ("#alternatives", "Atrasta vārda <> alternatīva"),
        ("#homonyms", "Atrasts vārda <> homonīms"),
    ];

    let fragment = Html::parse_fragment(&html_string);

    for (selector_str, return_str) in search_result_types {
        let selector = Selector::parse(&format!("{} a", selector_str)).unwrap();

        // some some some
        if let Some(frag) = fragment.select(&selector).next() {
            if let Some(link) = frag.value().attr("href") {
                return Some((
                    link.to_string(),
                    Regex::new("<>")
                        .unwrap()
                        .replace(return_str, format!("**{}**", search_query))
                        .to_string(),
                ));
            }
        }
    }

    return None;
}

pub async fn run(ctx: &Context, interaction: &ApplicationCommandInteraction) {
    let word_option = &interaction.data.options.get(0);
    let word_option = word_option.unwrap().resolved.as_ref().unwrap();

    if let CommandDataOptionValue::String(search_query) = word_option {
        let user_mention = match interaction.data.options.get(1) {
            Some(opt) => match opt.resolved.as_ref().unwrap() {
                CommandDataOptionValue::User(user, _) => format!("<@{}>\n", user.id),
                _ => "".to_string(),
            },
            None => "".to_string(),
        };

        let url = format!("https://tezaurs.lv/api/searchEntry?w={}", search_query);
        println!("URL: {}", url);
        let res = reqwest::get(&url).await;
        let res = if let Ok(res) = res {
            if let Ok(res) = res.text().await {
                res
            } else {
                return;
            }
        } else {
            return;
        };

        println!("{}", &res);
        let res_text = match find_word(&res, search_query) {
            Some((link, text)) => format!("{}{}\n{}\n{}", user_mention, text, url, link),
            None => format!("Vārds netika atrasts\n{}", url).to_string(),
        };

        if let Err(why) = interaction
            .create_interaction_response(&ctx.http, |res| {
                res.kind(InteractionResponseType::ChannelMessageWithSource)
                    .interaction_response_data(|msg| msg.content(&res_text))
            })
            .await
        {
            println!("Kļūme: {}", why)
        }
    }
}

pub fn register(command: &mut CreateApplicationCommand) -> &mut CreateApplicationCommand {
    return command
        .name("tezaurs")
        .description("Atrast vārda definīciju un homonīmus")
        .create_option(|option| {
            option
                .name("vārds")
                .description("Vārds ko meklēt")
                .required(true)
                .kind(CommandOptionType::String)
        })
        .create_option(|option| {
            option
                .name("lietotājs")
                .description("Lietotājs ko vēlies pieminēt (pingot)")
                .kind(CommandOptionType::User)
        });
}
