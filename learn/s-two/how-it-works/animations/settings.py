from manim import *

config.media_width = "100%"
config.verbosity = "WARNING"

RADIUS = 2

FULL = 2*PI

FAST = False

COLOR_PNT = RED
COLOR_TEXT = ManimColor("#0e0e0e")
COLOR_CIRCLE = GREEN
COLOR_AXIS_LABELS = BLUE
COLOR_PROJ_LINE = TEAL
COLOR_PROJ_DOT = GREY
COLOR_INTR_DOT = COLOR_PROJ_LINE
COLOR_INV_DOT = ORANGE
COLOR_INV_LINE = GREY
COLOR_GROUP = TEAL

SCALE = 1.3

X_MAX = 2
X_MIN = -2

Y_MAX = 2
Y_MIN = -2

grid = NumberPlane(
    x_range=(X_MIN, X_MAX, 1),
    y_range=(Y_MIN, Y_MAX, 1),
    x_length=8*SCALE,
    y_length=8*SCALE,
    faded_line_style={
        "stroke_color": BLACK,
        "stroke_width": 1,
        "stroke_opacity": 0.7
    },
    background_line_style={
        "stroke_color": GREY,
        "stroke_width": 4,
        "stroke_opacity": 0.6
    }
)

VERY_SMALL = 1e-15

LOC_LINE1 = grid.coords_to_point(0, Y_MIN * 1.1)
LOC_LINE2 = grid.coords_to_point(0, Y_MIN * 1.25)

LOC_PNT_EQ = LOC_LINE1
LOC_THETA_EQ = LOC_LINE2
LOC_T_VALUE = LOC_LINE1

# add the unit circle
x0y1 = grid.coords_to_point(0, 1)
x1y0 = grid.coords_to_point(1, 0)
x0yn1 = grid.coords_to_point(0, -1)
xy1y0 = grid.coords_to_point(-1, 0)

unit_circle = Circle.from_three_points(x0y1, x1y0, x0yn1)
unit_circle.set_stroke(color=COLOR_CIRCLE, width=4, opacity=0.5)

def configure(video):
    # background = ImageMobject("bg.png")
    # background.scale_to_fit_height(video.camera.frame_height)
    # video.add(background)
    video.camera.background_color = WHITE

def angle_to_complex(theta):
    return np.exp(1j * theta)

def angle_to_coords(theta):
    cmplx = angle_to_complex(theta)
    return grid.coords_to_point(cmplx.real, cmplx.imag)

def auto(f):
    v = f()
    v.add_updater(lambda d: d.become(f()))
    return v

def radian_line(angle):
    return Line(
        start=grid.coords_to_point(0, 0),
        end=angle_to_coords(angle),
        color=GREY,
        stroke_opacity=0.5,
        stroke_width=2
    )

def inv_line(start, end):
    return DashedLine(
        start=start,
        end=end,
        color=COLOR_INV_LINE
    )
