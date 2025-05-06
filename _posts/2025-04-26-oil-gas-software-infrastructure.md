---
layout: post
title: "From Self-Hosted to Cloud: An Interview About Oil & Gas Software Infrastructure"
date: 2025-04-26
---

Where once companies relied on physical servers in office closets, they've moved to co-located data centers and now increasingly to cloud services.  
  
In the vanguard of this evolution is [@_its_not_real_](https://x.com/_its_not_real_), who has witnessed these changes firsthand.  
  
Maybe the industry had an advantage from practical necessity, but between infrastructure challenges, regulatory pressures, and optimization needs, the way people manage industrial software systems has been changing. Recently, even traditionally conservative control systems are adapting to distributed computing models.  
  
This is a discussion about how technological change happens in regulated industries.  
  
And the cycles of how what it takes to maintain reliability is often balanced against convenience and cost.  
  
We go over:  

**PART 1**  
[The Shift from Self-Hosted to Co-Location](#the-shift-from-self-hosted-to-co-location)  
[Latency Challenges with SCADA Systems](#latency-challenges-with-scada-systems)  
[Database Consistency in Control Systems](#database-consistency-in-control-systems)  

**PART 2**  
[Regulation Differences Between Oil & Gas and Fracking Water](#regulation-differences-between-oil-gas-and-fracking-water)  
[Water Management Business Models](#water-management-business-models)  
[Alternative Disposal Methods](#alternative-disposal-methods)  

**PART 3**  
[Data Analysis for Operations](#data-analysis-for-operations)  
[Automation of Measurement Accounting](#automation-of-measurement-accounting)  
[Software Eating GIS Departments](#software-eating-gis-departments)  

**PART 4**  
[Control Room Automation Potential](#control-room-automation-potential)  
[Predictive Maintenance Opportunities](#predictive-maintenance-opportunities)  
[Route Optimization for Field Work](#route-optimization-for-field-work)  
[Building Trust with Field Personnel](#building-trust-with-field-personnel)  

***

## The Shift from Self-Hosted to Co-Location
 
*Can you tell me about how your company transitioned from self-hosted servers to co-location?*

We would literally have a server in a mini rack in the office where we were working. So you'd have all of our offices where we do programming and everything, and then there would be something a little better than a utility closet with two or three servers shoved in a rack.

That ended whenever our building flooded and damaged some of the equipment, and management realized we needed to move that to a co-located data center.

This was not a natural disaster related flood. It was literally just the plumbing in the building. So there wasn't like, "Oh, we could have powered it down, we knew there was a storm coming." It was just some bad design there.

That company was regulated, and when you're regulated, you can't have any downtime on your control system that exceeds certain specifications, depending on the pipes and the hazardous nature of the material. If it's down, you have to dispatch people out to the field to man those stations.

So there is a bit of an internal market feedback mechanism to decide if the amount of money that we're spending on our infrastructure is providing this benefit. In that case, we had to dispatch people out because the servers were dead. And so it was decided we just need to pay the co-location fee.

## Latency Challenges with SCADA Systems

*What were the trade-offs when moving to co-location?*

It is less convenient. But one thing that we ran into with the specific software that we were using then - it was called Clear SCADA, it's now called GeoSCADA - was that it was very sensitive to latency. The closer your client was to the server, the quicker the actions like clicking through menus would be, and it was very sensitive.

So initially, when we co-located everything to a data center, everything was very slow. People were complaining. We were trying to figure out why. Throughput, latency, everything to the servers at the co-located data center was fine, no issues.

Eventually, what we found out is you can use what they called a performance server and have it closer to the clients physically, or as far as latency is concerned. It will then rebroadcast out to the master servers at the data center. And that improved speeds, but then the clients can still fall back to the servers at the co-located data center if something does happen, so you still have redundancy built into the program.

I believe the latency tolerance on this program was once you started getting above 100 milliseconds is when you really started to grind to a halt. Anything over 50 was noticeable and irritating.

The performance server kind of became a staple of the deployment configurations that we did. Control systems like that are very resistant to trying new things or changing because it can be very expensive if something goes wrong. So once you have something that works, there's not a lot of want to test it out.

Other SCADA systems don't have that issue, but there are some other trade-offs with that. The big selling point of GeoSCADA is that it has a triple redundant, ACID compliant database. It's proprietary to that application, and they had that all the way back in, like, 2002 or something, which was pretty unheard of, to have a distributed database like that that could maintain synchronization across geographically diverse areas.

That's less true now, when you have like SQL Server as a managed service, but that was kind of their differentiator. Other applications didn't have the latency issues like that, but they didn't offer a triple redundant database that you could guarantee would always match no matter where you connected.

I believe that the latency we saw was a result of it trying to queue up all of the updates in an ordered manner from all the different clients.

## Database Consistency in Control Systems

*You mentioned ACID compliance. What does that mean in this context?*

ACID is a database concept. Whatever you think of SQL Server or Postgres or MySQL, they are ACID compliant. And what that means - it's a technical specification that doesn't have anything to do with oil and gas - but it essentially means operations on the database happen in an expected order. 

The way you update rows or delete rows or insert data is guaranteed to be consistent across multiple queries or concurrent users. It's just a way of ensuring database consistency.

The alternative to that are some of the newer NoSQL databases that have almost fallen back out of fashion again. MongoDB was one, and it wasn't ACID compliant, which means you can't guarantee consistency between your nodes. They're what's called eventually consistent. So eventually they will match, but it's kind of an unbounded time as to how long it will take them to both match if you have one all the way in California and one all the way in Texas.

The big thing with this is to ensure that the controls that are issued happen in the order that is expected. So if you have two controllers sitting next to each other, connected to the same server, or even connected to different servers in the triple redundant setup, and they both issued commands to the same facility, those commands have to be processed in the exact order that they came into the system.

There was also a lot of time synchronization that happened. We had to make sure our NTP servers had a very tight time tolerance, and any deviation from that would also cause issues. 

That was the big point of making sure commands in this system happened in order, because also for reporting, auditing compliance, you had to be able to show this control set point went out at this time, and this control set point went out at this time. And you can see those results happen in the field.

## Regulation Differences Between Oil & Gas and Fracking Water

*You mentioned your previous company was regulated. How does that compare to your current role?*

Yeah, so before it was oil and gas, and that's federally regulated and state regulated - by the TSA and PHMSA. Frack water is regulated differently in different states. We still report spills if something happens like that, but most of that is also between us and the landowner, because if you spill really salty water, that can damage their land.

But there's no requirements as far as what the control room has to account for or any kind of auditing. Most of it is environmental, as opposed to safety related. 

So there were a lot of safety related concerns with hazardous materials, where you want to make sure that you don't harm somebody or dump a bunch of methanol or anything into the atmosphere. Whereas with the frack water, it's strictly environmental, making sure you don't damage the environment, because people don't really get hurt by frack water itself. I mean, you don't want to drink it, but it's not hazardous having it laying there on the ground.

It's pretty much just salt water at this point. That wasn't the case historically, but as part of cost cutting measures and innovations, it's more or less just salt water now. You have some oil and stuff maybe get mixed in there occasionally, but producers don't want to do that because they want to keep it and sell it. So most of the time, yeah, just salt water. You may have some heavy metals or something like that.

## Water Management Business Models

*How does your business work with the fracking companies?*

I don't know strictly how it works on the commercial side, as far as inking deals and that kind of thing, but at an operations level, we'll have an agreement with a producer, and we will run pipes to their tank batteries. Those batteries are where they get the recovered water, and they send it to us through a series of pipes. We've got meters along the pipes. We've got pumps that run to pump the water.

We also do some treated water sell-back or fresh water. If you take the water and you dispose of it by injecting it into the ground, you're getting paid for taking the water, but you're paying to dispose of it. If we can treat it and resell it as fresh water to somebody, then we're being paid to take that and then we can also turn around and sell it.

There have been different studies with different universities. We've tried different approaches. Probably the biggest right now is just selling it back to somebody who's doing drilling so they can reuse water to drill, because they need clean water for that. But there has been some exploration of using it for agriculture, different things like that.

## Alternative Disposal Methods

*Are there other disposal methods besides injection?*

We've tried a variety of things. One of the things we tried was doing evaporation. This was not to treat the water but to dispose of it in another way.

The way we normally dispose of it is you have these old salt domes that you drill into, and then you just force that water in with pumps under high pressure underground, and that's where you get some of the earthquake activity. There are different things that can happen - the pressure differential to get into the ground may be too high, there may not be any spare space in the ground.

Certain areas out in Texas are very, very saturated, and not much more water can be pumped in, or you can see changes in elevation, where things have risen due to all the water that's been pumped down. So some states are taking a closer eye at that and not letting you pump as much water in, or not permitting disposal wells.

People have looked at alternatives like, can we take this water and put it in a pond and let the water evaporate and have the salt remain. There have been different approaches like that, to find alternative methods of disposal, because it would also save money if you're not having to sit there and run pumps - if you can just let the sun evaporate the water out.

## Data Analysis for Operations

*What kind of data analysis do you work on?*

A few things. One of the things that we just started this past week is monitoring oil in our system. The way it's written in our contracts, if producers send us oil, we get to keep it and turn around and sell it, because we still have to take care of it. It's got to be extracted from the water, because we can't discharge oil into the ground the way we can water.

So we have these skimming tanks set up to skim the oil off the water, and then eventually, once we have enough, we call somebody out to come pick it up, and we make money off of it. One of the analyses I'm getting ready to do is to look for when these oil tank levels start dropping and produce a report, because we're having some theft. Somebody's driving out there in the middle of the night, hooking their truck up to the oil tanks, pulling our oil down and driving off.

Another thing is trying to send alarms. The control room gets alarms whenever there is a potential safety hazard. So if a pressure gets too high, or if a pressure is too low and you have a flow that's too high, that indicates you have some kind of rupture.

The analysis that we're doing is looking for pressures that are abnormal, tank levels that are abnormal, or flows that are abnormal, and we look at the past four days of history. If we're sitting there watching that level and all of a sudden it has a rapid rate of change, then that tells us our tank is leaking if the change is negative, or maybe for some reason one of our pumps kicked on when it shouldn't have and started draining that tank.

For the pressures, if we're starting to see pressure deviations from the norm, that can mean that a pressure sensor is going bad, and we can get somebody out there to replace it before it goes bad, or before we're in an abnormal situation.

Most of it is just looking for leaks to make sure that meters and pressures and tanks are all reading what they had historically read, and don't have a wild swing.

## Automation of Measurement Accounting

*You mentioned that these analyses used to be done manually?*

That's for the measurement accounting piece. You'd have these meters measure how much volume passes through every day, and you would have people doing comparisons between what the customer said versus what we said, and looking for any kind of deviations.

A lot of that we've helped automate in my team specifically, and at my last job. Software in general has gotten better, so there are now programs that will do that comparison for you, or at least highlight rows that they think are potentially anomalous.

But yeah, that was something that had a lot of manual pieces to it that has been eaten by software as a service, or just internal programmers putting together relatively simple analysis tools.

## Software Eating GIS Departments

*Has the same thing happened with GIS departments?*

GIS is in the process of being eaten by software. At my company, we have no GIS people internally. We have a contract with a company to handle our GIS stuff, but even that is two or three people, and they are using a lot of ESRI software as a service, and kind of acting as a reseller, almost.

At my past company, you could see GIS functions slowly whittling away. Lots of those companies are still very siloed, and a lot of your promotion is based off of head count. So you're not going to have a lot of managers volunteering to let people go. But even then, some things become so noticeable that you can't hide it, and they may not lay people off, but they're not going to backfill positions when someone leaves. They wither by attrition.

It's a little harder out in the field with operations, but as far as corporate, yeah, bit by bit, as the software gets a little bit better. And oil and gas doesn't have as big of booms and busts as it used to. So when there's a downturn, you've got to lay people off. Maybe when the boom comes back, you've filled that position with software, and so the team's not going to grow as much as it did last time.

Layoffs have stabilized on the corporate side some. You still have layoffs, you still have hiring booms in oil and gas, but the swings are not as large as they were 10 years ago.

## Control Room Automation Potential

*You mentioned control room operations as an area with automation potential?*

Yeah, that's the entry level corporate role, more or less. There's a few other places you could probably start, but that's probably the closest. These guys sit there and they're clicking a lot, they're making calls.

They'll have an alarm come in, and when that alarm comes in, they have what they call the cause, consequence, and corrective action. An alarm comes in - the cause of that alarm is because the pressure is too high. The consequence of the pressure being too high is that the pipe might rupture, and the corrective action is a few different things. Maybe for a medium alarm, they just need to call the field and check in and see if everything's okay. If it's a critical alarm, maybe they need to shut that site in.

Since these things are very well defined, you could just have something that said, if it's a medium alarm, call the field and have them press one to acknowledge or two to take action. And if it's critical, immediately shut in the site.

But there's still a lot of hesitancy around automating things to that degree. Part of it is regulatory - lots of regulations, not in my control room specifically, but in other companies, have to have a human in the loop. At our place, we could probably get away with it on the legal side, but you still have a lot of people that are nervous.

And then the question becomes, well, if the automated system fails, who's there as a backup? You also have to think, with automated systems, how long does it take to go from automated to human intervention, and if a person isn't engaged, sometimes you can end up in a worse situation if the person has to pay attention every 10 minutes, as opposed to continuously.

That's part of what the automated analysis that we're doing has helped fix, because before you might have some of these lower level diagnostic alarms or just visual inspection, where the controller would go site to site and look and see, "Okay, is this pressure normal? Is this pressure normal?" And now they don't have to do that. The ones that have the highest anomaly score get pushed up to the top, and they can go check those out much quicker than going through and checking every site.

## Predictive Maintenance Opportunities

*You mentioned predictive maintenance as an area with potential?*

Yeah, we have all of this data. We're using TimescaleDB as our historian. So we have 100 terabytes of data at about a second level resolution, and that's for pumps, meters, variable frequency drives, tank levels - anything. It's there nice and clean with the timestamp.

Taking that and trying to figure out if we can determine when a pump is going to fail, when a pressure transmitter is going to fail, or even doing forecasting - are there other variables in there that might tell us we're going to receive water more on one day than the other? Are the oil rigs, are those guys working a little harder, working a little more efficiently on days with good weather? If we look at that and look at good weather days, are we seeing an increase in volume?

Maintenance, though, is the biggest one. If we know a bit ahead of time before a pump fails, we can replace it. We can cut down on regularly checking those. Right now we have somebody that goes out there twice a day and checks the oil on the pumps. We don't need to be checking the oil on the pumps twice a day, because you have to turn the pump off, so that's cutting into production. You got to turn the pump back on, so starts and stops wear the pumps out.

If we know we only need to check the oil on this pump when these metrics start looking bad, then we can reduce the amount of labor checking those pumps, reduce the downtime, and also probably have pumps that function longer and better over the course of their lifetime.

## Route Optimization for Field Work

*You mentioned potential for optimizing field work routes?*

You hear stories about UPS or FedEx optimizing for right turns to save gas. We do nothing like that, not even close.

You'll have 10 sites, and you'll have three guys. Let's use nine sites so it's evenly divisible - we have nine sites, three guys, and the way those are assigned to them are not well thought out. No one's sitting down and looking at where the roads are and what the most efficient route is. So this guy may get three that overlap with this other guy's three and they're criss-crossing each other when they don't need to.

You can fix that. There are off-the-shelf APIs right now, where you can give it a list of coordinates and get the most efficient path. That's not done for a variety of reasons. Number one, the supervisors don't really want to reveal how busy or not busy their guys are. The more guys they have, the bigger their title, the more money they're going to make.

And then if you do have a downturn, you want to leave yourself some spare room so you never have to get rid of anyone that you don't want to. So you've got some scapegoats at the bottom of the team.

We did a little study internally, and we were able to cut fuel usage by like 20% or something just from optimizing routes and not bothering with anything else. It just never got traction. Times aren't hard enough yet. Maybe they'll never be hard enough. With tariffs and everything, if there is a recession, I don't see more of that coming back.

It goes along with the maintenance. If you're only doing maintenance at sites A and B this week, then you only need to drive to sites A and B, and you can optimize that route and forget about C. But there's no kind of automated system in place to do that. So the easiest thing to make sure you don't miss anything is go to every site every day and run through your full checklist.

## Building Trust with Field Personnel

*How do you improve relationships with the field personnel?*

We are now going to our three different field offices once a month to meet the supervisors and any individual contributors that are free or want to hang around to figure out what parts of our software they don't like, or what we need to fix, any kind of bugs, things we're not aware of, new features.

We've tried to engage with them in the past. They're not very receptive to doing an online meeting. It doesn't work. There are some technical barriers - you'll get people who still don't know how to do a screen share on Microsoft Teams, or they don't have the language to explain what kind of bug they're seeing on their mobile app.

So going out there and fixing things that are easy wins, but impactful for them. One thing that they had was whenever they would mark something as a favorite in the app, so it would be at the top of the screen, it wasn't working. It apparently had not been working for years. We didn't know that, and they never told us. That's something that should have been caught in testing. There were some specifics around it that made it to where it didn't get caught in testing, but if we had known about it, it took all of 30 minutes to resolve.

We have a really good internal relationship with corporate customers, very high satisfaction. But with the field, they are just very stubborn. There's usually some tension between corporate and the field, because we're all sitting in nice, comfy chairs in our office, and they're out in the 110° Texas July heat, turning wrenches and being annoyed.

We did that a lot with the control room the first couple of years - going and sitting with them, seeing how they use the system, how they're clicking through things. Because there may be things that are easier, that are already in the system, that they're unaware of, or it may take us 10 minutes to make a new feature that saves them an hour every day. Now we're just trying to replicate that with the field.

***

## Most Impactful Automation

*What automation project has been most satisfying for you?*

The biggest one, it's probably going to sound trivial, but we had these cell phone modems, and these cell phone modems didn't have any kind of centralized management software. I think we had about 300-350 of them.

If there was ever a mass outage of any kind, in order to report that to the carrier, they would want to know what the phone number was assigned to that cell phone modem. Since it was still going through AT&T or Verizon or whoever, it still had a phone number associated with that account, and they could not tell us anything about the account based off of the IP address.

It uses something called an APN, which kind of moves the modem onto your private network, kind of like a VPN type thing, but it still has that number associated with it for the account. So we had all of the private IP addresses. We didn't have any of the phone numbers, and the interface for these was all written in JavaScript, so you couldn't scrape it like a plain HTML page. There was no API, there was no management software.

So we'd have to sit there and manually log into these one at a time to try to get some phone numbers so we could get with the account rep or the support rep to try to get some support as to why we had a mass outage of some kind.

I wrote this tool that would scrape the phone numbers by emulating the requests that this little JavaScript client had, and there were all these little idiosyncrasies based off of the versions. They're all running different software or firmware versions. But once we had that, we were able to join that phone number with the IP address, and then we just had a list that we could hand over to the support rep.

That sounds kind of simple, but it saved us 10-15 hours anytime there was any kind of disruption. And whenever you're spanning four or five states with cell phone modems, you're going to have a tower go down every once in a while that you need them to check out.
