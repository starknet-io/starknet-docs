all: \
	vid_circle_domain.mp4 \
	vid_canonic_coset.mp4

%.mp4: settings.py %*.py
	$(eval TMP := $(TMPDIR)/vid_$(basename $*))
	mkdir -p $(TMP)
	cp settings.py $(basename $*).py $(TMP)
	cd $(TMP) && manim -qm -r 1000,1000 --fps 60 --format=mp4 $(basename $*).py
	cp $(TMP)/media/videos/$(basename $*)/1000p60/Video.mp4 $*.mp4

clean:
	rm -rf media
	rm -f vid_*.mp4

.PHONY: clean
