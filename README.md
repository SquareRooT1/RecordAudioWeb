# RecordAudioWeb
Recording audio and save to firebase storage or save your computer.

We used this project for a research our question was :

There are several reasons why different platforms (satellite, cable TV, IPTV, streaming, etc.) show the linear (live) TV channels not exactly at the same time but within several seconds of each other. The delta delay is different from one platform to another; it often varies for different TV channels, too. That is, channel A on satellite could be rendered X seconds before it is rendered on IPTV and Y seconds before the streamed version to your mobile device, and X and Y can vary for channels B and C. How to measure the delay difference between this source.

We are taking record with exact timestamp and fingerprint this records and calculate results.We used python dejavu framework for fingerprinting. But you can use this app for any reason to record audio.

Config 
  - First Create firebase project and set your project rules to as long as our project has no authentication read and write rules should be true.
Then initialize your config in index.html

