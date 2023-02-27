use regex::Regex;
use reqwest;
use scraper::{Html, Selector};
use serenity::{
    builder::{CreateApplicationCommand, CreateEmbed},
    model::prelude::{
        command::CommandOptionType,
        interaction::{
            application_command::{ApplicationCommandInteraction, CommandDataOptionValue},
            InteractionResponseType,
        },
    },
    prelude::Context,
};

// -> (found word, formatted return string)
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
            if let Some(_) = frag.value().attr("href") {
                return Some((
                    frag.inner_html(),
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

fn make_embed(html_string: &str, word: &str, link: &str) -> CreateEmbed {
    let mut embed = CreateEmbed::default();
    embed
        .title(word)
        .url(link)
        .description("test")
        .color(0x0c86b6);

    let fragment = Html::parse_fragment(&html_string);
    let selector = Selector::parse("div.dict_Block").unwrap();
    let mut sources = fragment.select(&selector);
    embed.footer(|f| {
        let text_iter = sources.next().unwrap().text();
        f.text(text_iter.collect::<Vec<&str>>().join(""))
    });

    println!("{:#?}", &embed);

    return embed;
}

async fn fetch_from_url(url: &str) -> reqwest::Result<String> {
    reqwest::get(url).await?.text().await
}

pub async fn run(ctx: &Context, interaction: &ApplicationCommandInteraction) -> Result<(), ()> {
    let word_option = &interaction.data.options.get(0);
    let word_option = word_option.unwrap().resolved.as_ref().unwrap();
    let search_query = match word_option {
        CommandDataOptionValue::String(query) => query,
        _ => return Err(()),
    };

    let user_mention = match interaction.data.options.get(1) {
        Some(opt) => match opt.resolved.as_ref().unwrap() {
            CommandDataOptionValue::User(user, _) => format!("<@{}>\n", user.id),
            _ => "".to_string(),
        },
        None => "".to_string(),
    };

    let url = format!("https://tezaurs.lv/api/searchEntry?w={}", search_query);
    println!("URL: {}", url);
    let res = match fetch_from_url(&url).await {
        Ok(res) => res,
        Err(_) => return Err(()),
    };

    let (res_text, res_embed) = match find_word(&res, search_query) {
        Some((word, text)) => {
            let url = format!("https://tezaurs.lv/{}", word);
            println!("URL: {}", url);
            let res = match fetch_from_url(&url).await {
                Ok(res) => res,
                Err(_) => return Err(()),
            };

            let embed = make_embed(&res, &word, &url);
            (
                format!("{}{}\n{}\n{}", user_mention, text, url, word),
                Some(embed),
            )
        }
        None => (format!("Vārds netika atrasts\n{}", url).to_string(), None),
    };

    let _ = interaction
        .create_interaction_response(&ctx.http, |res| {
            res.kind(InteractionResponseType::ChannelMessageWithSource)
                .interaction_response_data(|msg| {
                    if let Some(e) = res_embed {
                        msg.add_embed(e);
                    };
                    msg.content(&res_text)
                })
        })
        .await;

    Ok(())
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
