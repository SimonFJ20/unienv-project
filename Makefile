
all: onejs

ONEJS_SRC=$(wildcard onejs/src/*)

onejs: onejs/grammar.ne $(ONEJS_SRC)
	cd onejs && yarn && yarn build
